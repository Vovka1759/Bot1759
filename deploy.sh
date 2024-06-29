#!/bin/bash

source deploy.env

latest_tag=$(docker images --format "{{.Tag}}" $DOCKER_IMAGE_NAME | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | sort -V | tail -1)

if [[ $latest_tag =~ ^v([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
  major=${BASH_REMATCH[1]}
  minor=${BASH_REMATCH[2]}
  patch=${BASH_REMATCH[3]}
  next_tag="v$major.$minor.$((patch + 1))"
else
  next_tag="v1.0.0"
fi

docker buildx build --platform linux/amd64 -t $DOCKER_IMAGE_NAME:$next_tag -t $DOCKER_IMAGE_NAME:latest .

docker save $DOCKER_IMAGE_NAME:latest > $DOCKER_IMAGE_NAME.tar

ssh -i $SSH_KEY_PATH $SSH_USER@$SSH_HOST << EOF
  mkdir -p '$REMOTE_DIR'
  sudo rm -f '$REMOTE_DIR/$DOCKER_IMAGE_NAME.tar'
EOF

scp -i $SSH_KEY_PATH $DOCKER_IMAGE_NAME.tar $SSH_USER@$SSH_HOST:$REMOTE_DIR/

ssh -i $SSH_KEY_PATH $SSH_USER@$SSH_HOST << EOF
  sudo docker stop $DOCKER_IMAGE_NAME
  sudo docker rm $DOCKER_IMAGE_NAME
  sudo docker image rm $DOCKER_IMAGE_NAME
  sudo docker load < $REMOTE_DIR/$DOCKER_IMAGE_NAME.tar
  sudo docker run --name $DOCKER_IMAGE_NAME -d $DOCKER_IMAGE_NAME
EOF

rm -rf $DOCKER_IMAGE_NAME.tar