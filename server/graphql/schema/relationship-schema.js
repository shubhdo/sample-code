const Relationship = `
type Relationship {
name: String,
  transitive: Boolean,
  professional: Boolean,
  aliases: [String],
  gloss: String,
  inverseOf: Relationship
}`;

module.exports = Relationship;
