mkdir backend/.nyc_output
curl http://localhost:5000/__coverage__ > backend/.nyc_output/out.json
$(npm bin)/nyc report --report-dir ./frontend/cover --temp-dir ./frontend/.nyc_output --reporter=lcov --reporter=clover --reporter=json
docker-compose -f docker-compose.cypress.yml run -v "$(pwd)"/backend:/var/temp prod-backend /var/www/app/node_modules/.bin/nyc report --report-dir /var/temp/cover --temp-dir /var/temp/.nyc_output --reporter=lcov --reporter=clover --reporter=json