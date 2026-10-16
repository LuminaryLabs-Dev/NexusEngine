// Public node.h signature, pinned with the Node shared-library/header hashes in the plan.
// Avoid importing V8 templates: this shim only calls Node's complete process entry point.
namespace node { int Start(int argc, char** argv); }
int main(int argc, char** argv) { return node::Start(argc, argv); }
