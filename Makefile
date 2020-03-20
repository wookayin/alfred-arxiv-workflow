.PHONY: install_dependencies export clean

PACKAGE_NAME="arxiv-search.alfredworkflow"
DEP_FILES=arxiv/ certifi/ chardet/ idna/ requests/ urllib3/ workflow/ feedparser.py

install_dependencies:
	# Download dependency packages via pip, into the workflow directory.
	# NOTE: If DistutilsOptionError occurs, see http://stackoverflow.com/questions/24257803
	# -
	pip install Alfred-Workflow>=1.27 --upgrade --ignore-installed --target .      # -> workflow/
	pip install arxiv==0.1.1          --upgrade --ignore-installed --target .      # -> arxiv/
	rm -rf *.dist-info/
	# All DONE :)

export:
	# export into .alfredworkflow package (which is a zip archive)
	zip -r $(PACKAGE_NAME)  $(shell git ls-files) $(DEP_FILES)
	unzip -lv $(PACKAGE_NAME)

clean:
	find . -name '*.pyc' | xargs rm -rf
	find . -name '__pycache__' | xargs rm -rf
	rm -rf .mypy_cache
