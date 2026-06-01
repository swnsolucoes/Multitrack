#!/usr/bin/env python3
"""
Webhook receiver para auto-deploy do GitHub.
Valida assinatura HMAC-SHA256 e roda o deploy em background.
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


def validate_signature(body: bytes, signature: str) -> bool:
    if not WEBHOOK_SECRET:
        log.warning("WEBHOOK_SECRET não configurado!")
        return False
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
        self.wfile.write(b"Deploy iniciado!")

        thread = threading.Thread(target=run_deploy, daemon=True)
        thread.start()

    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"MultiTrack Webhook OK")


if __name__ == "__main__":
    log.info(f"Webhook server escutando na porta {PORT}...")
    server = http.server.HTTPServer(("0.0.0.0", PORT), WebhookHandler)
    server.serve_forever()
