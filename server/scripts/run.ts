(async () => {
  const [, , fileName] = process.argv;
  if (!fileName) throw new Error('File name is required');
  process.argv.splice(2, 1);

  require(`./${fileName}.ts`);
})().catch((err) => console.log(err));
