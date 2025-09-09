const baseConfig = {
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'angular',
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
        },
        releaseRules: [
          // ========
          // DEFAULTS
          // ========
          { breaking: true, release: 'major' },
          { revert: true, release: 'patch' },
          { type: 'feat', release: 'minor' },
          { type: 'fix', release: 'patch' },
          { type: 'perf', release: 'patch' },
          // ======
          // CUSTOM
          // ======
          { type: 'bump', release: 'patch' },
          { type: 'bump', scope: 'patch', release: 'patch' },
          { type: 'bump', scope: 'minor', release: 'minor' },
          { type: 'bump', scope: 'major', release: 'major' },
          /*  */
          { type: 'deps', release: 'patch' },
          { type: 'deps', scope: 'package', release: 'patch' },
          { type: 'deps', scope: 'internal', release: 'minor' },
          /*  */
          { type: 'refactor', release: 'patch' },
          { type: 'revert', release: 'patch' },
        ],
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        writerOpts: {
          transform: (commit, context) => {
            let discard = true;
            const notes = commit.notes.map((note) => {
              discard = false;

              return {
                ...note,
                title: 'BREAKING CHANGES',
              };
            });

            let type = commit.type;

            if (commit.type === 'feat') {
              type = 'Features';
            } else if (commit.type === 'fix') {
              type = 'Bug Fixes';
            } else if (commit.type === 'perf') {
              type = 'Performance Improvements';
            } else if (commit.type === 'revert' || commit.revert) {
              type = 'Reverts';
            } else if (commit.type === 'deps') {
              type = 'Dependencies';
            } else if (commit.type === 'docs') {
              type = 'Documentation';
            } else if (commit.type === 'refactor') {
              type = 'Code Refactoring';
            } else if (commit.type === 'test') {
              if (commit.scope === 'unit') {
                type = 'Tests [unit]';
              } else if (commit.scope === 'e2e') {
                type = 'Tests [e2e]';
              } else {
                type = 'Tests';
              }
            } else if (commit.type === 'ci' || commit.scope === 'ci') {
              type = 'Continuous Integration';
            } else if (discard) {
              return;
            }

            const scope = commit.scope === '*' ? '' : commit.scope;
            const shortHash = typeof commit.hash === 'string' ? commit.hash.substring(0, 7) : commit.shortHash;

            const issues = [];
            let subject = commit.subject;

            if (typeof subject === 'string') {
              let url = context.repository ? `${context.host}/${context.owner}/${context.repository}` : context.repoUrl;
              if (url) {
                url = `${url}/issues/`;
                // Issue URLs.
                subject = subject.replace(/#([0-9]+)/g, (_, issue) => {
                  issues.push(issue);
                  return `[#${issue}](${url}${issue})`;
                });
              }
              if (context.host) {
                // User URLs.
                subject = subject.replace(/\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/g, (_, username) => {
                  if (username.includes('/')) {
                    return `@${username}`;
                  }

                  return `[@${username}](${context.host}/${username})`;
                });
              }
            }

            // remove references that already appear in the subject
            const references = commit.references.filter((reference) => !issues.includes(reference.issue));

            return {
              notes,
              type,
              scope,
              shortHash,
              subject,
              references,
            };
          },
          groupBy: 'type',
          commitGroupsSort: 'title',
          commitsSort: ['scope', 'subject'],
          noteGroupsSort: 'title',
        },
      },
    ],
  ],
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x',
    'main',
    {
      name: 'dev',
      prerelease: 'rc',
    },
  ],
};

function getDryRunConfig() {
  return {
    ...baseConfig,
  };
}

function getCIConfig() {
  // contains your normal semantic-release config
  // this will be used on your CI environment
  return {
    ...baseConfig,
    ...{
      plugins: [
        ...baseConfig.plugins,
        ...[
          [
            '@semantic-release/changelog',
            {
              changelogFile: 'docs/CHANGELOG.md',
            },
          ],
          [
            '@semantic-release/github',
            {
              assets: [
                {
                  path: 'docs/CHANGELOG.md',
                  label: 'Changelog',
                },
              ],
              successComment: false,
              releasedLabels: false,
              failTitle: false,
            },
          ],
        ],
      ],
    },
  };
}

function isDryRun() {
  return process.argv.includes('--dry-run');
}

module.exports = isDryRun() ? getDryRunConfig() : getCIConfig();
