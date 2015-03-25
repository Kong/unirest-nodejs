#!/bin/bash

JSDOC = node_modules/.bin/jsdoc
MOCHA = node_modules/.bin/mocha
MOCHA_SPAWN = node_modules/.bin/_mocha
ISTANBUL = node_modules/.bin/istanbul
COVERAGE_REPORT = ./coverage/lcov.info
CODECLIMATE = ./node_modules/.bin/codeclimate
COVERALLS = ./node_modules/coveralls/bin/coveralls.js
TESTS=-R spec --timeout 15000 tests/*

clean:
	rm -rf coverage
	rm -rf docs

test:
	$(MOCHA) $(TESTS)

docs:
	$(JSDOC) -c .jsdoc.json -r --verbose

coverage:
	$(ISTANBUL) cover $(MOCHA_SPAWN) -- $(TESTS)

coveralls:
	cat $(COVERAGE_REPORT) | $(COVERALLS)

codeclimate:
	cat $(COVERAGE_REPORT) | $(CODECLIMATE)

.PHONY: test clean docs coverage coveralls codeclimate