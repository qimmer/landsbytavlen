FROM postgis/postgis:17-3.5

RUN apt-get update && \
    apt-get install -y locales && \
    echo "da_DK.UTF-8 UTF-8" > /etc/locale.gen && \
    locale-gen && \
    update-locale LANG=da_DK.UTF-8