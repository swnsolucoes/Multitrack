#!/usr/bin/env python3
"""
Webhook receiver para auto-deploy do GitHub.
Valida assinatura HMAC-SHA256 e roda o deploy em background.

AVISO DE SEGURANÇA: Este container monta /var/run/docker.sock,
o que concede controle total sobre o Docker do host.
Mantenha WEBHOOK_SECRET rotacionado e o container isolado na rede interna.
Prefira usar o deploy nativo do Coolify/GitHub Actions quando disponível.
"""
import http.server
import hmac
import hashlib
import json
import subprocess
import threading
import os
import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [WEBHOOK] %(levelname)s %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
log = logging.getLogger(__name__)

WEBHOOK_SECRET = os.environ.get("WEBHOOK_SECRET", "")
PROJECT_DIR    = "/opt/multitrack"
DEPLOY_SCRIPT  = os.path.join(PROJECT_DIR, "deploy.sh")
PORT           = int(os.environ.get("WEBHOOK_PORT", "9001"))


def _startup_check():
    """Falha em inicialização se WEBHOOK_SECRET não estiver configurado."""
    if not WEBHOOK_SECRET:
        log.error(
            "WEBHOOK_SECRET não configurado! "
            "O servidor se recusa a iniciar sem segredo HMAC. "
            "Defina a variável de ambiente WEBHOOK_SECRET."
        )
        sys.exit(1)


def validate_signature(body: bytes, signature: str) -> bool:
    expected = "sha256=" + hmac.new(
        WEBHOOK_SECRET.encode(), body, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


def run_deploy():
    log.info("Iniciando deploy...")
    try:
        result = subprocess.run(
            ["bash", DEPLOY_SCRIPT],
            capture_output=True, text=True, timeout=900
        )
        if result.returncode == 0:
            log.info("Deploy concluido com sucesso!")
        else:
            log.error(f"Deploy falhou (exit {result.returncode}):\n{result.stderr}")
        log.info(result.stdout[-2000:] if len(result.stdout) > 2000 else result.stdout)
    except subprocess.TimeoutExpired:
        log.error("Deploy timeout (15min)")
    except Exception as e:
        log.error(f"Erro: {e}")


class WebhookHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        log.info(fmt % args)

    def do_POST(self):
        if self.path not in ("/hooks/deploy", "/hooks/deploy/"):
            self.send_response(404)
            self.end_headers()
            return

        length = int(self.headers.get("Content-Length", 0))
        body   = self.rfile.read(length)
        sig    = self.headers.get("X-Hub-Signature-256", "")
        event  = self.headers.get("X-GitHub-Event", "")

        if not validate_signature(body, sig):
            log.warning("Assinatura invalida! Ignorando.")
            self.send_response(401)
            self.end_headers()
            self.wfile.write(b"Unauthorized")
            return

        if event == "ping":
            log.info("GitHub ping recebido!")
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"pong")
            return

        if event != "push":
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"ignored")
            return

        try:
            payload = json.loads(body)
            ref = payload.get("ref", "")
        except Exception:
            ref = ""

        if ref != "refs/heads/main":
            log.info(f"Push em {ref}, ignorando (so reage ao main)")
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"ignored branch")
            return

        log.info("Push no main detectado! Disparando deploy...")
        self.send_response(202)
        self.end_headers()
        self.wfile.write(b"Accepted")

        thread = threading.Thread(target=run_deploy, daemon=True)
        thread.start()

    def do_GET(self):
        # Resposta mínima — não expõe detalhes do sistema
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"ok")


if __name__ == "__main__":
    _startup_check()
    log.info(f"Webhook server escutando na porta {PORT}...")
    server = http.server.HTTPServer(("0.0.0.0", PORT), WebhookHandler)
    server.serve_forever()
