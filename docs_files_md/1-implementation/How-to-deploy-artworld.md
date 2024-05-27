# How to deploy ARTWORLD

- up to date Linux machine (with correct security in place!) (contabo/digital ocean)
- nginx
- docker
- golang
- basic linux experience

# startup

`sudo apt-get install docker docker-compose nginx golang certbot node npm unzip`

# client code

- clone ARTWORLD_client code to /var/www/artworld/

```
mkdir /var/www/artworld
cd /var/www/artworld
wget https://github.com/studioplaynl/ARTWORLD_client/archive/refs/heads/main.zip
unzip main
mv ARTWORLD_client-main/ ARTWORLD_client
cd ARTWORLD_client/
npm install
npm run build
```

-edit your server domain name in ./src/nakama.svelte

# get nginx up and running:

- start by editing /var/www/nginx with the correct domain and folder settings

`sudo cp /var/www/nginx /etc/nginx/sites-enabled/artworld `

`sudo systemctl restart nginx`

- set your dns settings to point the domain to the correct IP adress

- get certbot for a certificate(as shown in the config example)

- now you can test the domain and see if the clientside code is up and running.

# server code

- clone the artworld server code to your home directory
- edit config.yml if necessary

` go mod vendor`

`npm run docker`

server should be live now.

# clone to betaworld server

this has als9o been automated as a cron job, running at 1am each day

```
sudo docker commit artworld_nakama_server_nakama_1 artworld_nakama
sudo docker save artworld_nakama | gzip | ssh root@185.193.67.152 'gunzip | docker load'

sudo docker commit artworld_nakama_server_postgres_1 artworld_postgres
sudo docker save artworld_postgres | gzip | ssh root@185.193.67.152 'gunzip | docker load'


```

# Amazon AWS

- Create a S3 bucket in Amazon AWS for storage of files.
  - object ownership: ACLs enabled(object writer)
  - block public acces: block all
  - bucket versioning: disabled
  - tag: none
  - encryption: disabled
  - advanced settings: disabled

cors settings:

```
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "PUT",
            "HEAD",
            "GET"
        ],
        "AllowedOrigins": [
            "https://yourdomain.com"
        ],
        "ExposeHeaders": []
    }
]

```

- create access key:
- click right top username > security credentials
- create user(permission: AWSS3FullAcces)
- create in the nakama server folder the file named "credentials"

```
[default]
aws_access_key_id = "youracceskeyid"
aws_secret_access_key = "youracceskey"

```

- update main.go

```
const (
	AWS_S3_REGION = "your region"
	AWS_S3_BUCKET = "your bucket"
)

```

## AWS image converter:

this is needed for converting images to the correct sizes incl. caching

to setup:

https://docs.aws.amazon.com/solutions/latest/serverless-image-handler/deployment.html

- press launch solution
- choose correct location in top right!
- choose following settings:
  AutoWebP No -
  CorsEnabled Yes -
  CorsOrigin https://yourwebsite.com -
  DeployDemoUI No -
  EnableDefaultFallbackImage No -
  EnableSignature Yes -
  FallbackImageS3Bucket - -
  FallbackImageS3Key - -
  LogRetentionPeriod 1 -
  SecretsManagerKey your secret key -
  SecretsManagerSecret your secret secret -
  SourceBuckets artworldstudioplay -

to create a secret go to: secretsmanager
https://eu-central-1.console.aws.amazon.com/secretsmanager/home?region=eu-central-1#!/listSecrets/

- other type of secret
- fill in key and value

## troubleshoot
