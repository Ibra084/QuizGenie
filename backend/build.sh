#!/usr/bin/env bash
set -o errexit

# Explicitly install Python 3.12
pyenv install 3.12.8 -s
pyenv global 3.12.8

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate

# Install requirements
pip install --upgrade pip
pip install -r requirements.txt
