# # sqlite3
# FROM ruby:3.1.2-alpine

# ARG SHOPIFY_API_KEY
# ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY

# RUN apk update && apk add nodejs npm git build-base sqlite-dev gcompat bash

# WORKDIR /app

# COPY web .

# RUN cd frontend && npm install

# RUN bundle install

# RUN cd frontend && npm run build
# RUN rake build:all

# COPY entrypoint.sh /usr/bin/
# RUN chmod +x /usr/bin/entrypoint.sh

# ENTRYPOINT ["entrypoint.sh"]





# # postgres
FROM ruby:3.1.2-alpine

ARG SHOPIFY_API_KEY
ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY

RUN apk update && apk add nodejs npm git build-base libpq-dev gcompat bash

WORKDIR /app

COPY web .

RUN cd frontend && npm install

RUN bundle install

RUN cd frontend && npm run build
RUN rake build:all

COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
