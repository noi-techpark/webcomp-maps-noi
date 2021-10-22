#!/bin/bash

# Create S3 buckets on AWS 
terraform init
terraform apply -auto-approve

exit 0