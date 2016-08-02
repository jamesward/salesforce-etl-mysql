Salesforce ETL MySQL
--------------------

This sample application shows a simple way to use a Node.js app along with Workflow on Salesforce to do Extract, Transform, and Load (ETL) from Salesforce to MySQL.

### Run on Heroku
1. Deploy the app: [![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)


### Run Locally

1. Create a local MySQL database named `demo`
1. Install the Node.js dependencies:

        npm install

1. Run the local dev server:

        npm run dev

1. Start an [ngrok](https://ngrok.com/) tunnel:

        ngrok http 5000


### Setup a Salesforce Workflow & Outbound Message

1. [Create a new Workflow](https://login.salesforce.com/01Q)
1. Select the `Contact` object
1. Give the rule a name
1. Select `created, and every time it's edited`
1. In the `Rule Critera` select `forumla evaluates to true` and enter `True` in the formula field
1. In `Immediate Workflow Actions` select `New Outbound Message`
1. Give the Outbound Message a name, enter the `Endpoint URL` for either your Heroku app (e.g. `https://foo.herokuapp.com/`) or your ngrok endpoint for local testing (e.g. `https://1234.ngrok.io/`)
1. Select the `Email`, `FirstName`, and `LastName` fields
