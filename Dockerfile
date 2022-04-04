FROM python:3.7-slim

WORKDIR /

ADD requirements.txt /requirements.txt
RUN mkdir /storage/ && pip install -r /requirements.txt

ADD redditdownloader /redditdownloader
ADD Run.py /Run.py

ENTRYPOINT [ "python", "-u", "/redditdownloader", "--settings=/storage/config/settings.json", "--docker"]
