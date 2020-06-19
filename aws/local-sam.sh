# replace the local version of the layer with a version from the server, because
# AWS bug, cf https://stackoverflow.com/questions/59325699/aws-layer-code-not-found-when-using-sam-invoke-local
sed s/\!Ref\ NodeModulesLayer/arn\:aws\:lambda\:us-east-2\:888526606788\:layer\:NodeModulesLayer\:10/ < template.yaml > templatelocal.yaml
sam local start-api -t templatelocal.yaml -p 3001
