mkdir backend/.nyc_output
curl http://localhost:5000/__coverage__ > backend/.nyc_output/out.json
docker-compose -f docker-compose.cypress.yml run -v "$(pwd)"/backend:/var/temp prod-backend /var/www/app/node_modules/.bin/nyc report --report-dir /var/temp/cover --temp-dir /var/temp/.nyc_output --reporter=lcov --reporter=clover --reporter=json
docker-compose -f docker-compose.cypress.yml run -v "$(pwd)"/frontend:/var/temp prod-frontend /var/www/app/node_modules/.bin/nyc report --report-dir /var/temp/cover --temp-dir /var/temp/.nyc_output --reporter=lcov --reporter=clover --reporter=json