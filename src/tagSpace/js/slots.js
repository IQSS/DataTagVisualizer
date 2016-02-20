/**
 * Handles the slot parsing
 *
 */
(function() {

	var tagSpaceTypes ={
		Todo: "ToDoType",
		Atomic:"AtomicType",
		Compound:"CompoundType",
		Aggregate:"AggregateType",
		Unknown:"UnknownType"
	};

	var app= angular.module('data-tags-visualizer')
		.constant('tagSpaceTypes',tagSpaceTypes)
		.service ("$slot", $slot);

	/*
	 constructor for atomic \ aggregated slot
	*/
	var slot = function (name,values,notes, type){
		this.type= type;
		this.name=name || "----";
		this.values= values || [];
		this.note=notes || "";

	};
	
	/*
	 constructor for compound slot
	*/
	var compound= function(name,  fieldTypes , note) {

		this.name=name;
		this.slots = fieldTypes;
		this.note = note || "";
		this.type= tagSpaceTypes.Compound;

	};


	var unknownSlot= function(data) {

		angular.forEach(data, function(key, value){
			this[key]=value;
		});

		if (!angular.isDefined (this.type)) {
			this.type=""
		}
		this.type+= "(unknown)";


	};

	function $slot(){
		return {
			atomic: 	function(name, values, notes){ return new slot(name, values,notes,tagSpaceTypes.Atomic)},
			Aggregate: function(name, values, notes){ return new slot(name, values,notes, tagSpaceTypes.Aggregate)},
			todo:   	function(name,notes){ return new slot(name, [],notes, tagSpaceTypes.Todo)},
			compound: 	function(name, slots, notes) { return new compound(name, slots, notes)},
			unknown: 	function (data) {return new unknownSlot(data)}
		};
	};






})();

