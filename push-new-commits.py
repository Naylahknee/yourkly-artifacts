#!/usr/bin/env python3
"""Push new local commits of yourkly-artifacts onto remote main via Git Database API.
Replays each local commit after <local_base> as a fresh commit on top of remote main."""
import base64
import json
import subprocess
import sys
import urllib.request

sys.path.insert(0, "/opt/hatch/skills/skill-creator/bin")
from dynamic_credentials import add_surrogate_to_request, read_json_response  # noqa: E402

ALLOWED_HOSTS = ("api.github.com",)
BASE = "https://api.github.com/repos/Naylahknee/yourkly-artifacts"
REPO_DIR = "/home/hatch/workspace/yourkly-artifacts"


def api(method, path, payload=None):
    data = None
    headers = {"Accept": "application/vnd.github+json",
               "X-GitHub-Api-Version": "2022-11-28",
               "User-Agent": "yourkly-artifacts-push"}
    if payload is not None:
        data = json.dumps(payload).encode()
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(BASE + path, data=data, headers=headers, method=method)
    add_surrogate_to_request(req, "custom.github", entry_name="access_token",
                             allowed_hosts=ALLOWED_HOSTS)
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            return read_json_response(resp)
    except urllib.error.HTTPError as exc:
        err = exc.read().decode("utf-8", "replace")[:400]
        raise RuntimeError(f"GitHub API {method} {path} -> {exc.code}: {err}") from exc


def git(*args):
    return subprocess.run(["git", *args], cwd=REPO_DIR, capture_output=True,
                          check=True, text=True).stdout.strip()


def git_bytes(*args):
    return subprocess.run(["git", *args], cwd=REPO_DIR, capture_output=True,
                          check=True).stdout


def main(local_base):
    remote_head = api("GET", "/git/refs/heads/main")["object"]["sha"]
    commits = git("log", "--reverse", "--format=%H %an %ae %s",
                  f"{local_base}..HEAD").splitlines()
    print(f"remote main at {remote_head[:8]}, replaying {len(commits)} commits")
    parent = remote_head
    for line in commits:
        sha, an, ae, msg = line.split(" ", 3)
        entries = []
        for tline in git("ls-tree", "-r", sha).splitlines():
            meta, path = tline.split("\t")
            mode, _typ, blobsha = meta.split(" ")
            content = git_bytes("cat-file", "-p", blobsha)
            blob = api("POST", "/git/blobs",
                       {"content": base64.b64encode(content).decode(), "encoding": "base64"})
            entries.append({"path": path, "mode": mode, "type": "blob", "sha": blob["sha"]})
        tree = api("POST", "/git/trees", {"tree": entries})
        commit = api("POST", "/git/commits",
                     {"message": msg, "tree": tree["sha"], "parents": [parent],
                      "author": {"name": an, "email": ae}})
        parent = commit["sha"]
        print(f"  {msg[:55]} -> {parent[:8]}")
    api("PATCH", "/git/refs/heads/main", {"sha": parent, "force": False})
    print(f"refs/heads/main -> {parent}")
    print("DONE")


if __name__ == "__main__":
    main(sys.argv[1])
