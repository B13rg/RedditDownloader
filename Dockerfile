FROM python:3.7-slim

WORKDIR /

ADD requirements.txt /requirements.txt
RUN mkdir /storage/ && pip --no-cache-dir install -r /requirements.txt

RUN apt-get -y update \
&& apt-get install ffmpeg -y \
&& rm -rf /var/lib/apt/lists/*

ADD redditdownloader /redditdownloader
ADD Run.py /Run.py

ENTRYPOINT [ "python", "-u", "/redditdownloader", "--settings=/storage/config/settings.json", "--docker"]
