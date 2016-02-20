/**
 *  Handles the Factories of all node Objects
 */
(function () {

	var nodeTypes = {
		set: "setNode",
		ask: "AskNode",
		call: 'CallNode',
		todo: 'TodoNode',
		end: 'EndNode',
		reject: 'RejectNode',
		unknown: 'Unknown',
		root: '$$root', // not a real node. this is a root node that is added as the parent of each cluster
	};

	angular.module('data-tags-visualizer')
		.constant('nodeTypes', nodeTypes)
		.service('$node', $node)
	;

		function $node (){
		return {
			rejectNode:  function (id,reason) { return new  rejectNode(id,reason)},
			endNode: 	 function (id) { return new endNode(id)},
			todNode:  	 function (id,text) { return new todNode(id,text)},
			callNode:  	 function (id, calleeId) { return new callNode(id, calleeId)},
			setNode: 	 function (id, assignments) { return new  setNode(id, assignments)},
			askNode:   	 function (id,question, terms, answers) { return new askNode(id, question, terms, answers)},
			unknown:	 function (node) { return new unknownNode(node)},
			isNode: 	 isNode
		}
	}

	function isNode (obj){

		if (angular.isObject(obj) && obj.hasOwnProperty('type')){
			for (var type in nodeTypes){
				 if (nodeTypes[type]== obj.type) return true;
			}
			return false;
		}

	}

	function rejectNode(id,reason){
		this.id= id;
		this.reason= reason;
		this.type= nodeTypes.reject;

	}

	function endNode(id){
		this.id= id;;
		this.type= nodeTypes.end;

	}

	function todNode(id, text){
		this.id= id;
		this.note =text;
		this.type= nodeTypes.todo;
	}

	function callNode(id, calleeId){
		this.id= id;
		this.calleeId =calleeId;
		this.type= nodeTypes.call;
	}

	function setNode(id, assignments){
		this.id= id;
		this.assignments = assignments;
		this.type= nodeTypes.set;
	}

 	function askNode(id,question, terms, answers){
		this.id= id;
		this.question= question;
		this.terms = terms;
		this.answers =answers;
		this.type= nodeTypes.ask;


	}

	function unknownNode(node){

		angular.forEach(node, function (key,value){
			this.key=value;
		});
		this.type= nodeTypes.unknown;
	}
})();






