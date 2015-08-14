# node-recipe
recipe recommendation

install docker:
http://docs.aws.amazon.com/AmazonECS/latest/developerguide/docker-basics.html#install_docker

elastic search docker
https://hub.docker.com/_/elasticsearch/

docker pull elasticsearch
docker run -p 9200:9200 -p 9300:9300  -d --name elastic_server elasticsearch 

node-recipe docker
git pull https://github.com/annishaa88/node-recipe

1. docker build -t anna/node-recipe .
2. docker run -p 3000:3000  --link elastic_server:elastic_server  -d  anna/node-recipe
