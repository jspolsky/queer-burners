sam package --output-template-file packaged.yaml --s3-bucket queerburnersdirectory.com-api-0001
sam deploy --template-file packaged.yaml --stack-name queer-burners-stack --capabilities CAPABILITY_IAM
