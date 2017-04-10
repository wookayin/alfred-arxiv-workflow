.PHONY: install_dependencies

install_dependencies:
	# Download dependency packages via pip, into the workflow directory.
	# NOTE: If DistutilsOptionError occurs, see http://stackoverflow.com/questions/24257803
	# -
	pip install Alfred-Workflow==1.24 --upgrade --ignore-installed --target .      # -> workflow/
	pip install arxiv==0.1.1          --upgrade --ignore-installed --target .      # -> arxiv/
	rm -rf *.dist-info/
	# All DONE :)
