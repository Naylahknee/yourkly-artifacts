// Git operations via the minimal Smart HTTP client (src/gitmini.js).
// No filesystem needed. All user-facing strings stay out of this file.
import { pushCommit } from './gitmini.js';

// Push a set of files as the first save point of a brand-new (empty) repo.
export async function pushInitialFiles({ remote, token, files, message }) {
  return pushCommit({ remote, token, ref: 'refs/heads/main', parentSha: null, files, message });
}

// Apply file changes on top of a known base commit. Returns the new SHA.
export async function pushChanges({ remote, token, baseSha, baseFiles, changes, message }) {
  const files = { ...baseFiles, ...changes };
  return pushCommit({ remote, token, ref: 'refs/heads/main', parentSha: baseSha, files, message });
}

// Point a project's main line at the winner's commit ("keep this one").
// The winner's commit already contains the full file set, so we rebuild the
// same tree on the project repo. Content-identical, new commit.
export async function pushWinnerToMain({ projectRemote, projectToken, projectSha, winnerFiles, winnerMessage }) {
  return pushCommit({
    remote: projectRemote, token: projectToken, ref: 'refs/heads/main',
    parentSha: projectSha, files: winnerFiles,
    message: winnerMessage || 'Kept the winning version',
  });
}
