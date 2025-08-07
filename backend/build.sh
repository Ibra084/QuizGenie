#!/usr/bin/env bash
# Exit on error
set -o errexit

# Modify this line if you need to change the Python version
PYTHON_VERSION=$(cat runtime.txt | cut -d '-' -f 2)

# Install the correct Python version
pyenv install $PYTHON_VERSION -s
pyenv global $PYTHON_VERSION

# Install dependencies
pip install -r requirements.txt