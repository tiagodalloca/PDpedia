$(function(){
    $("#maquina-de-escrever").typed({
      strings: ["(load \"dice_of_doom_v3.lisp\")\n(defparameter *num-players* 4)\n(defparameter *die-colors* '((255 63 63) (63 63 255) (63 255 63) \n                             (255 63 255)))\n(defparameter *max-dice* 5)\n(defparameter *ai-level* 2)\n(defun attacking-moves (board cur-player spare-dice)\n  (labels ((player (pos)\n\t\t   (car (aref board pos)))\n\t   (dice (pos)\n\t\t (cadr (aref board pos))))\n    (lazy-mapcan (lambda (src)\n                   (if (eq (player src) cur-player)\n                     (lazy-mapcan \n                       (lambda (dst)\n                         (if (and (not (eq (player dst) cur-player)) \n                                  (> (dice src) 1))\n                             (make-lazy (list (list (list src dst)\n      (game-tree (board-attack board cur-player src dst (dice src)) \n                 cur-player \n                 (+ spare-dice (dice dst)) \n                 nil)\n      (game-tree (board-attack-fail board cur-player src dst (dice src))\n                 cur-player \n                 (+ spare-dice (dice dst))\n                 nil))))\n                                      (lazy-nil)))\n                                  (make-lazy (neighbors src)))\n                     (lazy-nil)))\n                 (make-lazy (loop for n below *board-hexnum*\n\t\t\t\t  collect n)))))\n(defun board-attack-fail (board player src dst dice)\n  (board-array (loop for pos from 0\n                     for hex across board\n                     collect (if (eq pos src)\n                                 (list player 1)\n                               hex))))\n(defun roll-dice (dice-num)\n  (let ((total (loop repeat dice-num\n                     sum (1+ (random 6)))))\n    (fresh-line)\n    (format t \"On ~a dice rolled ~a. \" dice-num total)\n    total))\n(defun roll-against (src-dice dst-dice)\n  (> (roll-dice src-dice) (roll-dice dst-dice)))\n(defun pick-chance-branch (board move)\n  (labels ((dice (pos)\n                 (cadr (aref board pos))))\n    (let ((path (car move)))\n      (if (or (null path) (roll-against (dice (car path))\n                                        (dice (cadr path))))\n          (cadr move)\n        (caddr move)))))\n(defun handle-human (tree)\n  (fresh-line)\n  (princ \"choose your move:\")\n  (let ((moves (caddr tree)))\n    (labels ((print-moves (moves n)\n\t\t\t  (unless (lazy-null moves)\n\t\t\t    (let* ((move (lazy-car moves))\n\t\t\t\t   (action (car move)))\n\t\t\t      (fresh-line)\n\t\t\t      (format t \"~a. \" n)\n\t\t\t      (if action\n\t\t\t\t  (format t \"~a -> ~a\" (car action) (cadr action))\n\t\t\t\t(princ \"end turn\")))\n\t\t\t    (print-moves (lazy-cdr moves) (1+ n)))))\n\t    (print-moves moves 1))\n    (fresh-line)\n    (pick-chance-branch (cadr tree) (lazy-nth (1- (read)) moves))))\n(defun handle-computer (tree)\n  (let ((ratings (get-ratings (limit-tree-depth tree *ai-level*) (car tree))))\n    (pick-chance-branch\n      (cadr tree) \n      (lazy-nth (position (apply #'max ratings) ratings) (caddr tree)))))\n(defparameter *dice-odds* #(#(0.84 0.97 1.0 1.0)\n                            #(0.44 0.78 0.94 0.99)\n                            #(0.15 0.45 0.74 0.91)\n                            #(0.04 0.19 0.46 0.72)\n                            #(0.01 0.06 0.22 0.46)))\n(defun get-ratings (tree player)\n  (let ((board (cadr tree)))\n    (labels ((dice (pos)\n                   (cadr (aref board pos))))\n      (take-all (lazy-mapcar \n                  (lambda (move)\n                    (let ((path (car move)))\n                      (if path\n                          (let* ((src (car path))\n                                 (dst (cadr path))\n                                 (odds (aref (aref *dice-odds* \n                                                   (1- (dice dst)))\n                                             (- (dice src) 2))))\n                            (+ (* odds (rate-position (cadr move) player))\n                               (* (- 1 odds) (rate-position (caddr move)\n                                                            player))))\n                        (rate-position (cadr move) player))))\n                  (caddr tree))))))\n(defun limit-tree-depth (tree depth)\n  (list (car tree) \n\t  (cadr tree) \n\t  (if (zerop depth)\n\t      (lazy-nil)\n\t    (lazy-mapcar (lambda (move)\n                         (cons (car move)\n                               (mapcar (lambda (x)\n                                         (limit-tree-depth x (1- depth)))\n                                       (cdr move))))\n\t\t           (caddr tree)))))\n(defun get-connected (board player pos)\n  (labels ((check-pos (pos visited)\n             (if (and (eq (car (aref board pos)) player)\n                      (not (member pos visited)))\n                 (check-neighbors (neighbors pos) (cons pos visited))\n               visited))\n           (check-neighbors (lst visited)\n             (if lst\n                 (check-neighbors (cdr lst) (check-pos (car lst) visited))\n               visited)))\n    (check-pos pos '())))\n(defun largest-cluster-size (board player)\n  (labels ((f (pos visited best)\n\t      (if (< pos *board-hexnum*)\n\t\t  (if (and (eq (car (aref board pos)) player)\n                       (not (member pos visited)))\n\t\t      (let* ((cluster (get-connected board player pos))\n\t\t\t     (size (length cluster)))\n\t\t\t(if (> size best)\n\t\t\t    (f (1+ pos) (append cluster visited) size)\n\t\t\t  (f (1+ pos) (append cluster visited) best)))\n\t\t    (f (1+ pos) visited best))\n\t\tbest)))\n\t  (f 0 '() 0)))\n(defun add-new-dice (board player spare-dice)\n  (labels ((f (lst n)\n\t      (cond ((zerop n) lst)\n\t\t    ((null lst) nil)\n\t\t    (t (let ((cur-player (caar lst))\n\t\t\t     (cur-dice (cadar lst)))\n\t\t\t (if (and (eq cur-player player) (< cur-dice *max-dice*))\n                       (cons (list cur-player (1+ cur-dice))\n                             (f (cdr lst) (1- n)))\n\t\t\t   (cons (car lst) (f (cdr lst) n))))))))\n\t  (board-array (f (coerce board 'list) \n                        (largest-cluster-size board player)))))"],
      // strings: ["HandleSeq PatternMiner::RebindVariableNames(HandleSeq & orderedPattern, map < Handle, Handle > & orderedVarNameMap) {\n  HandleSeq rebindedPattern;\n  for (Handle link: orderedPattern) {\n    HandleSeq renameOutgoingLinks;\n    findAndRenameVariablesForOneLink(link, orderedVarNameMap, renameOutgoingLinks);\n    Handle rebindedLink = atomSpace - > add_link(atomSpace - > get_type(link), renameOutgoingLinks);\n    // XXX why do we need to set the TV ???\n    rebindedLink - > merge(TruthValue::TRUE_TV());\n    rebindedPattern.push_back(rebindedLink);\n  }\n  return rebindedPattern;\n}\n// the input links should be like: only specify the const node, all the variable node name should not be specified:\n// unifiedLastLinkIndex is to return where the last link in the input pattern is now in the ordered pattern\n// because the last link in input pattern is the externed link from last gram pattern\nHandleSeq PatternMiner::UnifyPatternOrder(HandleSeq & inputPattern, unsigned int & unifiedLastLinkIndex) {\n  // Step 1: take away all the variable names, make the pattern into such format string:\n  //    (InheritanceLink\n  //       (VariableNode )\n  //       (ConceptNode \"Animal\")\n  //    (InheritanceLink\n  //       (VariableNode )\n  //       (VariableNode )\n  //    (InheritanceLink\n  //       (VariableNode )\n  //       (VariableNode )\n  //    (EvaluationLink (stv 1 1)\n  //       (PredicateNode \"like_food\")\n  //       (ListLink\n  //          (VariableNode )\n  //          (ConceptNode \"meat\")\n  //       )\n  //    )\n  multimap < string, Handle > nonVarStrToHandleMap;\n  for (Handle inputH: inputPattern) {\n    string str = atomSpace - > atom_as_string(inputH);\n    string nonVarNameString = \"\";\n    std::stringstream stream(str);\n    string oneLine;\n    while (std::getline(stream, oneLine, '\n')) {\n      if (oneLine.find(\"VariableNode\") == std::string::npos) {\n        // this node is not a VariableNode, just keep this line\n        nonVarNameString += oneLine;\n      } else {\n        // this node is an VariableNode, remove the name, just keep \"VariableNode\"\n        nonVarNameString += \"VariableNode\";\n      }\n    }\n    nonVarStrToHandleMap.insert(std::pair < string, Handle > (nonVarNameString, inputH));\n  }\n  // Step 2: sort the order of all the handls do not share the same string key with other handls\n  // becasue the strings are put into a map , so they are already sorted.\n  // now print the Handles that do not share the same key with other Handles into a vector, left the Handles share the same keys\n  HandleSeq orderedHandles;\n  vector < string > duplicateStrs;\n  multimap < string, Handle > ::iterator it;\n  for (it = nonVarStrToHandleMap.begin(); it != nonVarStrToHandleMap.end();) {\n    int count = nonVarStrToHandleMap.count(it - > first);\n    if (count == 1) {\n      // if this key string has only one record , just put the corresponding handle to the end of orderedHandles\n      orderedHandles.push_back(it - > second);\n      it++;\n    } else {\n      // this key string has multiple handles to it, not put these handles into the orderedHandles,\n      // insteadly put this key string into duplicateStrs\n      duplicateStrs.push_back(it - > first);\n      it = nonVarStrToHandleMap.upper_bound(it - > first);\n    }\n  }\n  // Step 3: sort the order of the handls share the same string key with other handles\n  for (string keyString: duplicateStrs) {\n    // get all the corresponding handles for this key string\n    multimap < string, Handle > ::iterator kit;\n    vector < _non_ordered_pattern > sharedSameKeyPatterns;\n    for (kit = nonVarStrToHandleMap.lower_bound(keyString); kit != nonVarStrToHandleMap.upper_bound(keyString); ++kit) {\n      _non_ordered_pattern p;\n      p.link = kit - > second;\n      generateIndexesOfSharedVars(p.link, orderedHandles, p.indexesOfSharedVars);\n      sharedSameKeyPatterns.push_back(p);\n    }\n    std::sort(sharedSameKeyPatterns.begin(), sharedSameKeyPatterns.end());\n    for (_non_ordered_pattern np: sharedSameKeyPatterns) {\n      orderedHandles.push_back(np.link);\n    }\n  }\n  // find out where the last link in the input pattern is now in the ordered pattern\n  Handle lastLink = inputPattern[inputPattern.size() - 1];\n  unsigned int lastLinkIndex = 0;\n  for (Handle h: orderedHandles) {\n    if (h == lastLink) {\n      unifiedLastLinkIndex = lastLinkIndex;\n      break;\n    }\n    ++lastLinkIndex;\n  }\n  // in this map, the first Handle is the variable node is the original Atomspace,\n  // the second Handle is the renamed ordered variable node in the Pattern Mining Atomspace.\n  map < Handle, Handle > orderedVarNameMap;\n  HandleSeq rebindPattern = RebindVariableNames(orderedHandles, orderedVarNameMap);\n  return rebindPattern;\n}\nstring PatternMiner::unifiedPatternToKeyString(HandleSeq & inputPattern,\n  const AtomSpace * atomspace) {\n  if (atomspace == 0)\n    atomspace = this - > atomSpace;\n  string keyStr = \"\";\n  for (Handle h: inputPattern) {\n    keyStr += Link2keyString(h, \"\", atomspace);\n    keyStr += \"\n\";\n  }\n  return keyStr;\n}\nbool PatternMiner::checkPatternExist(const string & patternKeyStr) {\n  if (keyStrToHTreeNodeMap.find(patternKeyStr) == keyStrToHTreeNodeMap.end())\n    return false;\n  else\n    return true;\n}\nvoid PatternMiner::generateNextCombinationGroup(bool * & indexes, int n_max) {\n  int trueCount = -1;\n  int i = 0;\n  for (; i < n_max - 1; ++i) {\n    if (indexes[i]) {\n      ++trueCount;\n      if (!indexes[i + 1])\n        break;\n    }\n  }\n  indexes[i] = false;\n  indexes[i + 1] = true;\n  for (int j = 0; j < trueCount; ++j)\n    indexes[j] = true;\n  for (int j = trueCount; j < i; ++j)\n    indexes[j] = false;\n}\nbool PatternMiner::isLastNElementsAllTrue(bool * array, int size, int n) {\n  for (int i = size - 1; i >= size - n; i--) {\n    if (!array[i])\n      return false;\n  }\n  return true;\n}\nunsigned int combinationCalculate(int r, int n) {\n  // = n!/(r!*(n-r)!)\n  int top = 1;\n  for (int i = n; i > r; i--) {\n    top *= i;\n  }\n  int bottom = 1;\n  for (int j = n - r; j > 1; j--) {\n    bottom *= j;\n  }\n  return top / bottom;\n}\n// valueToVarMap:  the ground value node in the orginal Atomspace to the variable handle in pattenmining Atomspace\nvoid PatternMiner::generateALinkByChosenVariables(Handle & originalLink, map < Handle, Handle > & valueToVarMap, HandleSeq & outputOutgoings, AtomSpace * _fromAtomSpace) {\n  HandleSeq outgoingLinks = originalLink - > getOutgoingSet();\n  for (Handle h: outgoingLinks) {\n    if (_fromAtomSpace - > is_node(h)) {\n      if (valueToVarMap.find(h) != valueToVarMap.end()) {\n        // this node is considered as a variable\n        outputOutgoings.push_back(valueToVarMap[h]);\n      } else {\n        // this node is considered not a variable, so add its bound value node into the Pattern mining Atomspace\n        Handle value_node = atomSpace - > add_node(_fromAtomSpace - > get_type(h), _fromAtomSpace - > get_name(h));\n        // XXX why do we need to set the TV ???\n        value_node - > merge(TruthValue::TRUE_TV());\n        outputOutgoings.push_back(value_node);\n      }\n    } else {\n      HandleSeq _outputOutgoings;\n      generateALinkByChosenVariables(h, valueToVarMap, _outputOutgoings, _fromAtomSpace);\n      Handle reLink = atomSpace - > add_link(_fromAtomSpace - > get_type(h), _outputOutgoings);\n      // XXX why do we need to set the TV ???\n      reLink - > merge(TruthValue::TRUE_TV());\n      outputOutgoings.push_back(reLink);\n    }\n  }\n}\n// valueToVarMap:  the ground value node in the orginal Atomspace to the variable handle in pattenmining Atomspace\n// _fromAtomSpace: where is input link from\nvoid PatternMiner::extractAllNodesInLink(Handle link, map < Handle, Handle > & valueToVarMap, AtomSpace * _fromAtomSpace) {\n  HandleSeq outgoingLinks = link - > getOutgoingSet();\n  for (Handle h: outgoingLinks) {\n    if (_fromAtomSpace - > is_node(h)) {\n      if (valueToVarMap.find(h) == valueToVarMap.end()) {\n        // add a variable node in Pattern miner Atomspace\n        Handle varHandle = atomSpace - > add_node(opencog::VARIABLE_NODE, \"$var~\" + toString(valueToVarMap.size()));\n        valueToVarMap.insert(std::pair < Handle, Handle > (h, varHandle));\n      }\n      if ((_fromAtomSpace - > get_type(h) == opencog::VARIABLE_NODE))\n        cout << \"Error: instance link contains variables: \n\" << _fromAtomSpace - > atom_as_string(h) << std::endl;\n    } else {\n      extractAllNodesInLink(h, valueToVarMap, _fromAtomSpace);\n    }\n  }\n}\nvoid PatternMiner::extractAllVariableNodesInAnInstanceLink(Handle & instanceLink, Handle & patternLink, OrderedHandleSet & allVarNodes) {\n  HandleSeq ioutgoingLinks = instanceLink - > getOutgoingSet();\n  HandleSeq poutgoingLinks = patternLink - > getOutgoingSet();\n  HandleSeq::iterator pit = poutgoingLinks.begin();\n  for (Handle h: ioutgoingLinks) {\n    if (originalAtomSpace - > is_node(h)) {\n      if ((atomSpace - > get_type( * pit) == opencog::VARIABLE_NODE)) {\n        if (allVarNodes.find(h) == allVarNodes.end()) {\n          allVarNodes.insert(h);\n        }\n      }\n    } else {\n      extractAllVariableNodesInAnInstanceLink(h, (Handle & )( * pit), allVarNodes);\n    }\n    pit++;\n  }\n}\nvoid PatternMiner::extractAllVariableNodesInAnInstanceLink(Handle & instanceLink, Handle & patternLink, map < Handle, unsigned int > & allVarNodes, unsigned index) {\n  HandleSeq ioutgoingLinks = instanceLink - > getOutgoingSet();\n  HandleSeq poutgoingLinks = patternLink - > getOutgoingSet();\n  HandleSeq::iterator pit = poutgoingLinks.begin();\n  for (Handle h: ioutgoingLinks) {\n    if (originalAtomSpace - > is_node(h)) {\n      if ((atomSpace - > get_type( * pit) == opencog::VARIABLE_NODE)) {\n        if (allVarNodes.find(h) == allVarNodes.end()) {\n          allVarNodes.insert(std::pair < Handle, unsigned > (h, index));\n        }\n      }\n    } else {\n      extractAllVariableNodesInAnInstanceLink(h, (Handle & )( * pit), allVarNodes, index);\n    }\n    pit++;\n  }\n}\n// map<Handle, unsigned> allNodes  , unsigned is the index the first link this node belongs to\nvoid PatternMiner::extractAllNodesInLink(Handle link, map < Handle, unsigned int > & allNodes, AtomSpace * _fromAtomSpace, unsigned index) {\n  HandleSeq outgoingLinks = link - > getOutgoingSet();\n  for (Handle h: outgoingLinks) {\n    if (_fromAtomSpace - > is_node(h)) {\n      if (allNodes.find(h) == allNodes.end()) {\n        allNodes.insert(std::pair < Handle, unsigned > (h, index));\n      }\n    } else {\n      extractAllNodesInLink(h, allNodes, _fromAtomSpace, index);\n    }\n  }\n}\nvoid PatternMiner::extractAllNodesInLink(Handle link, OrderedHandleSet & allNodes, AtomSpace * _fromAtomSpace) {\n  HandleSeq outgoingLinks = link - > getOutgoingSet();\n  for (Handle h: outgoingLinks) {\n    if (_fromAtomSpace - > is_node(h)) {\n      if (allNodes.find(h) == allNodes.end()) {\n        allNodes.insert(h);\n      }\n    } else {\n      extractAllNodesInLink(h, allNodes, _fromAtomSpace);\n    }\n  }\n}"],
      typeSpeed: -10000
    });
});
$(function(){
    $("#maquina-de-apresentar").typed({
      strings: ["Registre aquilo que é importante de verdade",
                "Descubra o seu cotidiano",
                "Arme sua própria revolução",
                "Arme seu próprio grupo de estudo",
                "Compartilhe conhecimento",
                "Faça-se ouvir",
                ],
      // strings: ["HandleSeq PatternMiner::RebindVariableNames(HandleSeq & orderedPattern, map < Handle, Handle > & orderedVarNameMap) {\n  HandleSeq rebindedPattern;\n  for (Handle link: orderedPattern) {\n    HandleSeq renameOutgoingLinks;\n    findAndRenameVariablesForOneLink(link, orderedVarNameMap, renameOutgoingLinks);\n    Handle rebindedLink = atomSpace - > add_link(atomSpace - > get_type(link), renameOutgoingLinks);\n    // XXX why do we need to set the TV ???\n    rebindedLink - > merge(TruthValue::TRUE_TV());\n    rebindedPattern.push_back(rebindedLink);\n  }\n  return rebindedPattern;\n}\n// the input links should be like: only specify the const node, all the variable node name should not be specified:\n// unifiedLastLinkIndex is to return where the last link in the input pattern is now in the ordered pattern\n// because the last link in input pattern is the externed link from last gram pattern\nHandleSeq PatternMiner::UnifyPatternOrder(HandleSeq & inputPattern, unsigned int & unifiedLastLinkIndex) {\n  // Step 1: take away all the variable names, make the pattern into such format string:\n  //    (InheritanceLink\n  //       (VariableNode )\n  //       (ConceptNode \"Animal\")\n  //    (InheritanceLink\n  //       (VariableNode )\n  //       (VariableNode )\n  //    (InheritanceLink\n  //       (VariableNode )\n  //       (VariableNode )\n  //    (EvaluationLink (stv 1 1)\n  //       (PredicateNode \"like_food\")\n  //       (ListLink\n  //          (VariableNode )\n  //          (ConceptNode \"meat\")\n  //       )\n  //    )\n  multimap < string, Handle > nonVarStrToHandleMap;\n  for (Handle inputH: inputPattern) {\n    string str = atomSpace - > atom_as_string(inputH);\n    string nonVarNameString = \"\";\n    std::stringstream stream(str);\n    string oneLine;\n    while (std::getline(stream, oneLine, '\n')) {\n      if (oneLine.find(\"VariableNode\") == std::string::npos) {\n        // this node is not a VariableNode, just keep this line\n        nonVarNameString += oneLine;\n      } else {\n        // this node is an VariableNode, remove the name, just keep \"VariableNode\"\n        nonVarNameString += \"VariableNode\";\n      }\n    }\n    nonVarStrToHandleMap.insert(std::pair < string, Handle > (nonVarNameString, inputH));\n  }\n  // Step 2: sort the order of all the handls do not share the same string key with other handls\n  // becasue the strings are put into a map , so they are already sorted.\n  // now print the Handles that do not share the same key with other Handles into a vector, left the Handles share the same keys\n  HandleSeq orderedHandles;\n  vector < string > duplicateStrs;\n  multimap < string, Handle > ::iterator it;\n  for (it = nonVarStrToHandleMap.begin(); it != nonVarStrToHandleMap.end();) {\n    int count = nonVarStrToHandleMap.count(it - > first);\n    if (count == 1) {\n      // if this key string has only one record , just put the corresponding handle to the end of orderedHandles\n      orderedHandles.push_back(it - > second);\n      it++;\n    } else {\n      // this key string has multiple handles to it, not put these handles into the orderedHandles,\n      // insteadly put this key string into duplicateStrs\n      duplicateStrs.push_back(it - > first);\n      it = nonVarStrToHandleMap.upper_bound(it - > first);\n    }\n  }\n  // Step 3: sort the order of the handls share the same string key with other handles\n  for (string keyString: duplicateStrs) {\n    // get all the corresponding handles for this key string\n    multimap < string, Handle > ::iterator kit;\n    vector < _non_ordered_pattern > sharedSameKeyPatterns;\n    for (kit = nonVarStrToHandleMap.lower_bound(keyString); kit != nonVarStrToHandleMap.upper_bound(keyString); ++kit) {\n      _non_ordered_pattern p;\n      p.link = kit - > second;\n      generateIndexesOfSharedVars(p.link, orderedHandles, p.indexesOfSharedVars);\n      sharedSameKeyPatterns.push_back(p);\n    }\n    std::sort(sharedSameKeyPatterns.begin(), sharedSameKeyPatterns.end());\n    for (_non_ordered_pattern np: sharedSameKeyPatterns) {\n      orderedHandles.push_back(np.link);\n    }\n  }\n  // find out where the last link in the input pattern is now in the ordered pattern\n  Handle lastLink = inputPattern[inputPattern.size() - 1];\n  unsigned int lastLinkIndex = 0;\n  for (Handle h: orderedHandles) {\n    if (h == lastLink) {\n      unifiedLastLinkIndex = lastLinkIndex;\n      break;\n    }\n    ++lastLinkIndex;\n  }\n  // in this map, the first Handle is the variable node is the original Atomspace,\n  // the second Handle is the renamed ordered variable node in the Pattern Mining Atomspace.\n  map < Handle, Handle > orderedVarNameMap;\n  HandleSeq rebindPattern = RebindVariableNames(orderedHandles, orderedVarNameMap);\n  return rebindPattern;\n}\nstring PatternMiner::unifiedPatternToKeyString(HandleSeq & inputPattern,\n  const AtomSpace * atomspace) {\n  if (atomspace == 0)\n    atomspace = this - > atomSpace;\n  string keyStr = \"\";\n  for (Handle h: inputPattern) {\n    keyStr += Link2keyString(h, \"\", atomspace);\n    keyStr += \"\n\";\n  }\n  return keyStr;\n}\nbool PatternMiner::checkPatternExist(const string & patternKeyStr) {\n  if (keyStrToHTreeNodeMap.find(patternKeyStr) == keyStrToHTreeNodeMap.end())\n    return false;\n  else\n    return true;\n}\nvoid PatternMiner::generateNextCombinationGroup(bool * & indexes, int n_max) {\n  int trueCount = -1;\n  int i = 0;\n  for (; i < n_max - 1; ++i) {\n    if (indexes[i]) {\n      ++trueCount;\n      if (!indexes[i + 1])\n        break;\n    }\n  }\n  indexes[i] = false;\n  indexes[i + 1] = true;\n  for (int j = 0; j < trueCount; ++j)\n    indexes[j] = true;\n  for (int j = trueCount; j < i; ++j)\n    indexes[j] = false;\n}\nbool PatternMiner::isLastNElementsAllTrue(bool * array, int size, int n) {\n  for (int i = size - 1; i >= size - n; i--) {\n    if (!array[i])\n      return false;\n  }\n  return true;\n}\nunsigned int combinationCalculate(int r, int n) {\n  // = n!/(r!*(n-r)!)\n  int top = 1;\n  for (int i = n; i > r; i--) {\n    top *= i;\n  }\n  int bottom = 1;\n  for (int j = n - r; j > 1; j--) {\n    bottom *= j;\n  }\n  return top / bottom;\n}\n// valueToVarMap:  the ground value node in the orginal Atomspace to the variable handle in pattenmining Atomspace\nvoid PatternMiner::generateALinkByChosenVariables(Handle & originalLink, map < Handle, Handle > & valueToVarMap, HandleSeq & outputOutgoings, AtomSpace * _fromAtomSpace) {\n  HandleSeq outgoingLinks = originalLink - > getOutgoingSet();\n  for (Handle h: outgoingLinks) {\n    if (_fromAtomSpace - > is_node(h)) {\n      if (valueToVarMap.find(h) != valueToVarMap.end()) {\n        // this node is considered as a variable\n        outputOutgoings.push_back(valueToVarMap[h]);\n      } else {\n        // this node is considered not a variable, so add its bound value node into the Pattern mining Atomspace\n        Handle value_node = atomSpace - > add_node(_fromAtomSpace - > get_type(h), _fromAtomSpace - > get_name(h));\n        // XXX why do we need to set the TV ???\n        value_node - > merge(TruthValue::TRUE_TV());\n        outputOutgoings.push_back(value_node);\n      }\n    } else {\n      HandleSeq _outputOutgoings;\n      generateALinkByChosenVariables(h, valueToVarMap, _outputOutgoings, _fromAtomSpace);\n      Handle reLink = atomSpace - > add_link(_fromAtomSpace - > get_type(h), _outputOutgoings);\n      // XXX why do we need to set the TV ???\n      reLink - > merge(TruthValue::TRUE_TV());\n      outputOutgoings.push_back(reLink);\n    }\n  }\n}\n// valueToVarMap:  the ground value node in the orginal Atomspace to the variable handle in pattenmining Atomspace\n// _fromAtomSpace: where is input link from\nvoid PatternMiner::extractAllNodesInLink(Handle link, map < Handle, Handle > & valueToVarMap, AtomSpace * _fromAtomSpace) {\n  HandleSeq outgoingLinks = link - > getOutgoingSet();\n  for (Handle h: outgoingLinks) {\n    if (_fromAtomSpace - > is_node(h)) {\n      if (valueToVarMap.find(h) == valueToVarMap.end()) {\n        // add a variable node in Pattern miner Atomspace\n        Handle varHandle = atomSpace - > add_node(opencog::VARIABLE_NODE, \"$var~\" + toString(valueToVarMap.size()));\n        valueToVarMap.insert(std::pair < Handle, Handle > (h, varHandle));\n      }\n      if ((_fromAtomSpace - > get_type(h) == opencog::VARIABLE_NODE))\n        cout << \"Error: instance link contains variables: \n\" << _fromAtomSpace - > atom_as_string(h) << std::endl;\n    } else {\n      extractAllNodesInLink(h, valueToVarMap, _fromAtomSpace);\n    }\n  }\n}\nvoid PatternMiner::extractAllVariableNodesInAnInstanceLink(Handle & instanceLink, Handle & patternLink, OrderedHandleSet & allVarNodes) {\n  HandleSeq ioutgoingLinks = instanceLink - > getOutgoingSet();\n  HandleSeq poutgoingLinks = patternLink - > getOutgoingSet();\n  HandleSeq::iterator pit = poutgoingLinks.begin();\n  for (Handle h: ioutgoingLinks) {\n    if (originalAtomSpace - > is_node(h)) {\n      if ((atomSpace - > get_type( * pit) == opencog::VARIABLE_NODE)) {\n        if (allVarNodes.find(h) == allVarNodes.end()) {\n          allVarNodes.insert(h);\n        }\n      }\n    } else {\n      extractAllVariableNodesInAnInstanceLink(h, (Handle & )( * pit), allVarNodes);\n    }\n    pit++;\n  }\n}\nvoid PatternMiner::extractAllVariableNodesInAnInstanceLink(Handle & instanceLink, Handle & patternLink, map < Handle, unsigned int > & allVarNodes, unsigned index) {\n  HandleSeq ioutgoingLinks = instanceLink - > getOutgoingSet();\n  HandleSeq poutgoingLinks = patternLink - > getOutgoingSet();\n  HandleSeq::iterator pit = poutgoingLinks.begin();\n  for (Handle h: ioutgoingLinks) {\n    if (originalAtomSpace - > is_node(h)) {\n      if ((atomSpace - > get_type( * pit) == opencog::VARIABLE_NODE)) {\n        if (allVarNodes.find(h) == allVarNodes.end()) {\n          allVarNodes.insert(std::pair < Handle, unsigned > (h, index));\n        }\n      }\n    } else {\n      extractAllVariableNodesInAnInstanceLink(h, (Handle & )( * pit), allVarNodes, index);\n    }\n    pit++;\n  }\n}\n// map<Handle, unsigned> allNodes  , unsigned is the index the first link this node belongs to\nvoid PatternMiner::extractAllNodesInLink(Handle link, map < Handle, unsigned int > & allNodes, AtomSpace * _fromAtomSpace, unsigned index) {\n  HandleSeq outgoingLinks = link - > getOutgoingSet();\n  for (Handle h: outgoingLinks) {\n    if (_fromAtomSpace - > is_node(h)) {\n      if (allNodes.find(h) == allNodes.end()) {\n        allNodes.insert(std::pair < Handle, unsigned > (h, index));\n      }\n    } else {\n      extractAllNodesInLink(h, allNodes, _fromAtomSpace, index);\n    }\n  }\n}\nvoid PatternMiner::extractAllNodesInLink(Handle link, OrderedHandleSet & allNodes, AtomSpace * _fromAtomSpace) {\n  HandleSeq outgoingLinks = link - > getOutgoingSet();\n  for (Handle h: outgoingLinks) {\n    if (_fromAtomSpace - > is_node(h)) {\n      if (allNodes.find(h) == allNodes.end()) {\n        allNodes.insert(h);\n      }\n    } else {\n      extractAllNodesInLink(h, allNodes, _fromAtomSpace);\n    }\n  }\n}"],
      typeSpeed: 1,
      backSpeed: -20
    });
});
