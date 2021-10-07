terraform {
  required_version = ">= 0.12"
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = "eu-west-1"
}

resource "aws_s3_bucket" "it-bz-noi-maps-images-test" {
  bucket = "it.bz.noi.maps.images.test"
  acl    = "public-read"
  policy = file("test/policy.json")

  website {
    index_document = "index.html"
  }
}

resource "aws_s3_bucket" "it-bz-noi-maps-images" {
  bucket = "it.bz.noi.maps.images"
  acl    = "public-read"
  policy = file("prod/policy.json")

  website {
    index_document = "index.html"
  }
}
