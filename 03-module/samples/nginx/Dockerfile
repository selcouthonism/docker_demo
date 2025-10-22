FROM nginx:1.29.2

#RUN apt-get update
#RUN apt-get -y install vim
RUN apt-get update && apt-get -y install vim

#copy file from local machine into docker image
COPY index.html /usr/share/nginx/html/index.html

#RUN chown nginx:nginx /usr/share/nginx/html/index.html