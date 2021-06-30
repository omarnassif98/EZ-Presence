FROM python:3.9-buster
WORKDIR /app
ADD . /app
RUN pip install -r requirements.txt
ENV FLASK_APP=caller.py
CMD ["flask", "run"]