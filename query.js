
import alfy from 'alfy';
import arxiv from 'arxiv-api';

const M = {};

M.query_arxiv = async function(input) {
  // query arxiv API.
  input = input.replace('-', ' ');
  var papers = await arxiv.search({
      searchQueryParams: [
          {
              include: [{name: input}],
          },
      ],
      start: 0,
      maxResults: 25,
  });

  // Clean up the JSON entry.
  papers = papers.map(function(p) {
    p.title = p.title.replace(/\s*\n\s*/, ' ');
    p.authors = p.authors.map(x => x.flat()[0]);
    p.url = p.id;   // "https://arxiv.org/abs/1234.56789v2"

    var match = p.url.match(/^https?:\/\/arxiv.org\/(pdf|abs)\/([\w.\-\/]+)(v\d+)(\.pdf)?$/);
    var id = (match || [])[2];
    var ver = (match || [])[3];

    p.id = id;     // 1234.56789
    p.ver = ver;   // v2
    p.canonical_url = `https://arxiv.org/abs/${id}`;
    p.year = p.published.substring(0, 4);
    return p;
  });

  // TODO: employ better ranking.
  return papers;
};

M.generate_bibtex = function(p) {
  var repr_author = p.authors[0].split(' ');
  repr_author = repr_author[repr_author.length - 1];

  return `@article{${repr_author}:${p.id},
author = {${p.authors.join(' and ')}},
title = {{${p.title}}},
year = {${p.year}},
eprint = {${p.id}},
eprinttype = {arXiv},
}
`;
};

M.to_alfred_items = function(papers) {
  var paper_to_entry = function(p) {
    // p: arXiv paper entry.
    return {
      //title: p.title,
      title: p.id ? `[${p.id}] ${p.title}` : p.title,
      subtitle: p.authors.join(', '),
      arg: p.canonical_url,
      url: p.url,
      text: {
        // text to copy, cmd+C
        copy: `[${p.title}](${p.canonical_url})`,
        // largetype display text, cmd+L
        largetype: p.title + "\n\n" + p.authors.join(', ') + "\n" + p.canonical_url,
      },
      mods: {
        // alt(option): Open the PDF instead of abstract page.
        alt: {subtitle: `Open http://arxiv.org/pdf/${p.id}`,
              arg: `http://arxiv.org/pdf/${p.id}`},
        // cmd: Copy the url of the abstract page.
        cmd: {subtitle: `http://arxiv.org/abs/${p.id}`},
        // shift: Copy to the clipboard the identifier.
        shift: {subtitle: `Copy the identifier to the clipboard: ${p.id}`,
                arg: `${p.id}`},
        // ctrl: Copy to the clipboard a BibTex entry.
        ctrl: {subtitle: `Copy BibTex entry of ${p.id} to the clipboard`,
               arg: M.generate_bibtex(p)
        },
      }
    }
  };

  return papers.map(paper_to_entry);
};

M.query = async function(input) {
  var papers = await M.query_arxiv(input);
  return M.to_alfred_items(papers);
};

// Execute when running from Alfred.
const argv = process.argv.slice(2);
if (process.env.alfred_workflow_name) {
  alfy.output(await M.query(alfy.input));
}
else if (argv.length) {
  var result = await M.query(argv.join(' '));
  //var result = await M.query_arxiv(argv.join(' '));
  console.log(result);
}

const query = M;
export default query;
