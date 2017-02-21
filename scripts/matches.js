if (new RegExp(process.argv[2]).test(process.version)) {
  process.exit(0);
} else {
  process.exit(1);
}
