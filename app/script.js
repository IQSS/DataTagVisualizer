//
//if (navigator.userAgent.toLowerCase().indexOf("chrome")>-1) {
//	document.write(" <link href='../src/css/desicion-graph-visualizer.css' rel='stylesheet'> ");
//} else {
//	document.write(" <link href='../src/css/desicion-graph-visualizer-firefox.css' rel='stylesheet'> ");
//}
//

var app= angular.module('mainModule',['data-tags-visualizer']);



app.controller("mainController", function($scope, dataService , graphInstance,$timeout,nodeColors,nodeTypes){

	$scope.decisionGraph=null;
	$scope.tagSpace= null;
	$scope.active = [ true, false];

	$scope.openFile=function()	{

		var promisedData =dataService.getData();

		promisedData.then(function (data) {

			$scope.active[0]=true;
			$scope.decisionGraph=data.decisionGraph;
			$scope.tagSpace=data.tagSpace;
			$scope.showGraphItems=true
		});
	}

	$scope.exportJpg = function(){

		var pic= graphInstance.get().jpg({bg: 'white' ,full : true, scale: 2});
		var link = document.createElement('a');
		link.href = pic;
		link.download = 'decisionGraph.jpg';
		document.body.appendChild(link);
		link.click();
		link.remove();
	}

	$scope.showGraphItems=false;


	$scope.refreshGraph =function(){

		if (graphInstance.get()) {
			$timeout(function () {
					graphInstance.get().resize();
				},
				200);
		}

	}


	$scope.colors={}


	$scope.getClusters=function(){

		var res=[];
		if (!!$scope.decisionGraph ){

			var root= $scope.decisionGraph.getStartNode().getRoot();
			var first= root.substr(0, root.indexOf ( nodeTypes.root ));
			res.push(first);
			angular.forEach($scope.decisionGraph, (function(cluster , name){
				if (name!= 'getStartNode'&& first!=name){
					res.push(name);
				}
			}));
		}
		return res;
	}

	$scope.openCluster=function(clusterName){

		var cluster=$scope.decisionGraph[clusterName];
		cy = graphInstance.get();

		var c =(cy.$("node[id='"+clusterName+ nodeTypes.root+ "']"));
		if ( c.length==0){

			c= cy.add(cluster);
			//cy.layout(cy.options);

		}
		cy.layout(cy.options);
		//cy.animate({
        //
		//	center: {eles: c},
		//	zoom: 1
        //
		//});

	}


	angular.forEach(nodeColors,function(value,key) {

		if (key!=nodeTypes.root) {
			var i = key.indexOf('Node');
			var fixedKey = key.substr(0, i);
			$scope.colors[fixedKey] = value;
		}
	})
});




