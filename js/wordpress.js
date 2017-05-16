// friends factory
appControllers.factory('WordPress',['$http', function($http) {
	var data = {};
	data.getPosts = function (page) {
		return $http(
			{
				method: 'GET', url:'http://kidzforce.com/api/get_recent_posts/?page='+page
			}
		);
	}
	data.getPostsTaxonamy = function (type, slug, page) {
		if(type == 'tag') {
			return $http(
				{
					method: 'GET', url:'http://kidzforce.com/api/get_tag_posts/?page='+page+'&slug='+slug
				}
			);
		} else if(type == 'category') {
			return $http(
				{
					method: 'GET', url:'http://kidzforce.com/api/get_category_posts/?page='+page+'&slug='+slug
				}
			);
		}
	}
	data.getCategories = function () {
		return $http(
			{
				method: 'GET', url:'http://kidzforce.com/api/get_category_index/'
			}
		);
	}
	data.getTags = function () {
		return $http(
			{
				method: 'GET', url:'http://kidzforce.com/api/get_tag_index/'
			}
		);
	}
  	return data;
}]);
appControllers.factory('globalFactory', function() {
	return {
		// get first image or feed
		getPostImageFeed: function( postContent ) {
			var div = document.createElement('div');
			div.innerHTML = postContent;
			var img = div.getElementsByTagName("img");
			var iframe = div.getElementsByTagName("iframe");
			if (img.length >= 1) {
				imgthumb = img[0].src;
				return imgthumb;
			} else if (iframe.length >= 1){
				iframeVideo = iframe[0].src;
				var re = /(\?v=|\/\d\/|\/embed\/)([a-zA-Z0-9\-\_]+)/;
				videokeynum = iframeVideo.match(re);
				if(videokeynum) {
					videokey = iframeVideo.match(re)[2];
					imageurl = 'http://i2.ytimg.com/vi/'+videokey+'/0.jpg';
					return imageurl;	              
			  }
			}
		}
	};
});