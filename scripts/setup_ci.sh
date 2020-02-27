#!/bin/bash
echo DB_URI=${DB_URI} > .env
echo GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID} >> .env
echo GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET} >> .env
echo SESSION_SECRET=${SESSION_SECRET} >> .env
echo CYPRESS_RECORD_KEY=${CYPRESS_RECORD_KEY} >> .env
echo MAPQUEST_KEY=${MAPQUEST_KEY} >> .env
echo MAPQUEST_URI=${MAPQUEST_URI} >> .env 
echo REACT_APP_MAPBOX_ACCESS_TOKEN=${REACT_APP_MAPBOX_ACCESS_TOKEN} >> .env
echo REACT_APP_API_URI=${REACT_APP_API_URI} >> .env 
echo FE_URI=${FE_URI} >> .env 

# Copy over the .env file to the frontend directory so that when we do a production build for FE,
# it sees all these environment variables as well. Since 
# it's required that these environment variables are there at build time,
# for example REACT_APP_API_URI will be able to 
# be integrated into the production bundle of the app.
cp .env ./frontend/.env