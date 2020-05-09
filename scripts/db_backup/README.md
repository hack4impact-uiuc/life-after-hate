# Nightly Database Backup 😴🌙

## Problem

We host mission critical data for LAH which also happens to be sensitive, so any loss _or_ leakage could be catastrophic. Hence the need for a backup solution, furthermore one which is secure.

We also aim to keep costs of hosting this solution to a minimum, so a serverless solution is applicable: wake up, back up the database to somewhere safe, go back to sleep until tomorrow.

## Solution

As a serverless platform, AWS Lambda is reliable, easy to use, and extensible enough to do pretty much anything within its limited computing resources. Lambda is not the tool for computation-intensive processes or long-running server code, but it is adept at handling many small workloads. Given this, it is a suitable tool for database backup as we will only pay for at most 2\*30 GB\*seconds (given the current configuration) of server time each day.

### Reliability

We expect to be able to rely the CloudWatch Events bus for triggering, Lambda for execution, and S3 for storage. We can set alarms to notify us in the event of any failure. It might also be prudent to include the last successful backup time in the admin portal as a peace-of-mind measure.

### Implementation Details

To deploy this system, run the deployment script: [`./deploy.sh`](./deploy.sh). As you can see in [`template.yml`](./template.yml), this will create a CloudFormation stack with three resources: a Lambda function, a trigger event which will call the Lambda function daily (the S3 bucket must already exist), and an SNS topic for any failure notifications. You may draw an analogy of CloudFormation deploy to GNU Make; it builds a dependecy graph and creates or updates resources as necessary.

Each night, the CloudWatch Events trigger will send an asynchronous invocation event to the Lambda function. The Lambda will execute, and retry twice in the case of any failures. If this still doesn't work, it will send a JSON package containing the request and error response to the SNS topic which will email any subscibers this information.

A note, backups are made using `mongodump --gzip . . . `, so any restoration must be made using `mongorestore --gzip . . . `.


```
               _________________________________
              |                                 |_____    __
              |   off to deliver the backups!   |     |__|  |_________
              |_________________________________|     |::|  |        /
 /\**/\       |                                 \.____|::|__|      <
( o_o  )_     |                                       \::/  \._______\
 (u--u   \_)  |
  (||___   )==\
,dP"/b/=( /P"/b\
|8 || 8\=== || 8
`b,  ,P  `b,  ,P
  """`     """`
```
