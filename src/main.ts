const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const token = core.getInput('token');
    const items_string = core.getInput('items');
    const items = JSON.parse(items_string);
    const context = github.context;

    if (context.payload.pull_request == null && context.payload.action == 'reopened') {
    // if (context.payload.pull_request == null && context.payload.action == 'opened') {
      const issue_number = context.payload.issue.number;
      const body = context.payload.issue.body;

      for (let item of items) {
        if (body.includes(item.string)) {
          if (item.string == null || item.reply == null) {
            console.log('Must provide string and reply!');
            return
          }

          const octokit = new github.GitHub(token);
          const new_comment = octokit.issues.createComment({
            ...context.repo,
            issue_number: issue_number,
            body: item.reply,
          });

          if (item.labels != null) {
            console.log('Adding labels!')
            const add_label = octokit.issues.addLabels({
              ...context.repo,
              issue_number: issue_number,
              labels: item.labels
            });
          }

          if (item.close != null && item.close) {
            console.log('Closing issue!')
            core.debug('Closing issue');
            const close_issue = octokit.issues.update({
              ...context.repo,
              issue_number: issue_number,
              state: 'closed'
            });
          }

          break;
        }
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
