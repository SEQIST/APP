#!/bin/bash

for i in {1..20}
do
  curl -X POST http://localhost:5001/api/workproducts \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Work Product $i\", \"description\": \"Beschreibung für Work Product $i\"}"
  echo "Work Product $i erstellt"
done
