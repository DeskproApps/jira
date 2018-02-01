#!/usr/bin/env bash

echo Discoverying dpat installation directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SECRETS_DIR="$( cd "${DIR}/../secrets" && pwd )"

if [ -z "${SECRETS_DIR}" ] ; then
    echo failure: could not access output folder
    exit 1
fi

echo Generating jira keys in ${SECRETS_DIR}

if openssl genrsa -out ${SECRETS_DIR}/private.pem 2048 ; then
    echo success: private key generated at ${SECRETS_DIR}/private.pem
else
    echo failure: failed to generate private key at ${SECRETS_DIR}/private.pem
    exit 1
fi

if openssl rsa -in ${SECRETS_DIR}/private.pem -outform PEM -pubout -out ${SECRETS_DIR}/public.pem; then
    echo success: deskpro formatted public key generated at ${SECRETS_DIR}/public.pem
else
    echo failure: failed to generate public key at ${SECRETS_DIR}/public.pem
    exit 1
fi

if openssl rsa -pubout -in ${SECRETS_DIR}/private.pem -out ${SECRETS_DIR}/public.key; then
    echo success: jira formatted public key generated at ${SECRETS_DIR}/public.key
else
    echo failure: failed to generate public key at ${SECRETS_DIR}/public.key
    exit 1
fi

