ARG BASE_IMAGE=docker.io/library/debian:bookworm-slim@sha256:5ae3c39ebd15e229dcedd5cee596b2497182493d41ff162e824ba13fc1b2b867
FROM ${BASE_IMAGE}

ARG TAMARIN_VERSION=1.12.0
ARG TAMARIN_SOURCE_COMMIT=82780bbaf3328a45f624ddb41e51bf75425f851c
ARG TAMARIN_ASSET_SHA256=201be06f469e47cff554df6ca93db8366fc2c69d70c61fcbd1370a1074b469c6
ARG MAUDE_SHA256=1eefc2d8f96eb1b99f7c13e0149a3f4b982e8dfb061bd7e78b6a90916dd80968
ARG PRELUDE_SHA256=3e7147ee4a6ff96eb726abf9bbbb998ba340324342e2a7d5cf01c68794608a11
ARG ROOT=/
ARG LOCAL_PREFIX=usr/local
ARG BIN_COMPONENT=bin
ARG SHARE_COMPONENT=share
ARG VAR_COMPONENT=var
ARG TMP_COMPONENT=tmp
ARG SOURCE_DOCKER_PATH=etc/docker/res

WORKDIR ${ROOT}${VAR_COMPONENT}/${TMP_COMPONENT}

RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      ca-certificates curl libbdd0c2 libgmp10 libsigsegv2 libtinfo6 libtecla1 \
 && curl -fsSL "https://github.com/tamarin-prover/tamarin-prover/releases/download/${TAMARIN_VERSION}/tamarin-prover-${TAMARIN_VERSION}-linux64-ubuntu.tar.gz" -o tamarin.tar.gz \
 && echo "${TAMARIN_ASSET_SHA256}  tamarin.tar.gz" | sha256sum -c - \
 && tar -xzf tamarin.tar.gz -C "${ROOT}${LOCAL_PREFIX}/${BIN_COMPONENT}" \
 && curl -fsSL "https://raw.githubusercontent.com/tamarin-prover/tamarin-prover/${TAMARIN_SOURCE_COMMIT}/${SOURCE_DOCKER_PATH}/maude" -o "${ROOT}${LOCAL_PREFIX}/${BIN_COMPONENT}/maude" \
 && echo "${MAUDE_SHA256}  ${ROOT}${LOCAL_PREFIX}/${BIN_COMPONENT}/maude" | sha256sum -c - \
 && ln -s "${ROOT}lib/x86_64-linux-gnu/libtinfo.so.6" "${ROOT}lib/x86_64-linux-gnu/libtinfo.so.5" \
 && curl -fsSL "https://raw.githubusercontent.com/tamarin-prover/tamarin-prover/${TAMARIN_SOURCE_COMMIT}/${SOURCE_DOCKER_PATH}/prelude.maude" -o "${ROOT}${LOCAL_PREFIX}/${SHARE_COMPONENT}/prelude.maude" \
 && echo "${PRELUDE_SHA256}  ${ROOT}${LOCAL_PREFIX}/${SHARE_COMPONENT}/prelude.maude" | sha256sum -c - \
 && chmod 0555 "${ROOT}${LOCAL_PREFIX}/${BIN_COMPONENT}/tamarin-prover" "${ROOT}${LOCAL_PREFIX}/${BIN_COMPONENT}/maude" \
 && apt-get purge -y --auto-remove curl \
 && useradd --create-home tamarin

ENV LANG=C.UTF-8 LC_ALL=C.UTF-8 MAUDE_LIB=${ROOT}${LOCAL_PREFIX}/${SHARE_COMPONENT}
LABEL org.opencontainers.image.title="LicoArc pinned Tamarin proof runtime" \
      org.opencontainers.image.version="1.12.0" \
      org.opencontainers.image.source="https://github.com/tamarin-prover/tamarin-prover.git" \
      org.opencontainers.image.revision="82780bbaf3328a45f624ddb41e51bf75425f851c"

USER tamarin
WORKDIR ${ROOT}work
ENTRYPOINT ["tamarin-prover"]
