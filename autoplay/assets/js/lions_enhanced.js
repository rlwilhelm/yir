(function(){
    // variables
    var debug = (window.location.href.substr(0,5) == "file:")
    if(debug)var _gaq = [];
    
    var dataList, loadedDataList, currentSlide = 0, navActive=false, hasGallery=false, isTweening=false, navtimeout=6, navTimeoutInt, videoLoading=false, isDeepLink=false, isAboutLink=false, titleTimeout, videoLoadTime=0, vidTimer, navHover=false, isMuted=false, isScrolling=false, indexFullRes=false, lastLoadedItem=4, lastLoadedVideo=4, fullResToLoad, fullResLoaded, fullResLoading=false, autoPlayAudio=false, audioCredit=false, lastDirection, allVideosPreloaded=false, slideTitleScreen=false;
    
    // functions
    var createIndex, loadIndexFullRes, resizeIndexImages, swapIndexImages, fisherYates, createSlides, loadContent, launchFullscreen, cancelFullscreen, showShareButtons, hideShareButtons, setShareButtons, setGalleryControls, setAudioControls, showAudioCredit, hideAudioCredit, checkMuteAudio, fixGalleries, loadGalleryFullRes, galleryChange, closeOutSlide, changeLeft, changeRight, loadSlide, showSlide,  cleanUp, startContent, checkNavTimeout, killNav, startNav, startVideoLoadTimer, stopVideoLoadTimer, startPreloadAnimation, setiPadPlayBtn, resetiPadBtn, startiPadContent, setHeights, finishLoadProcess, loaderProgress;
    
    $('.navbuttons').css('height',$(window).height() - $('.global-header').height());
    
    dataList = [];
    loadedDataList = [];
    
    $('.resources ul li').each(function(){
        dataList.push($(this));
    });
    
    // Using the dataList build out the index information
    createIndex = function(){
        
        // Create 3 columns of links, math to determine how many in each column
        var dataLength = dataList.length, totItems = dataLength, columnHeight = Math.ceil(totItems/3);
        
        // building containers
        var columns = $('<div class="columns" />')
        var col1 = $('<div class="col" />');
        var col1ul = $('<ul />');
        var col2 = $('<div class="col" />');
        var col2ul = $('<ul />');
        var col3 = $('<div class="col" />');
        var col3ul = $('<ul />');
        
        // Put it together and what have you got? Bibbity, bobbity, boo!
        col1.append(col1ul);
        columns.append(col1);
        col2.append(col2ul);
        columns.append(col2);
        col3.append(col3ul);
        columns.append(col3);
        columns.append('<div class="clear" />');
        $('.index_nav').append(columns);
        
        // Add the about slide
        //var abtItem = $('<div class="about_link"><ul><li id="about_idx">About the Project</li></ul></div>');
        //$('li', abtItem).data('cID', 0);
        //columns.append(abtItem);
        
        // build the remaining nav items
        for(var i=0;i< dataLength;i++){
            
            // load each slide into dragarea
            var item = dataList[i];
            if(!Modernizr.touch||$('html').hasClass('ie10')){ // NO TOUCH - IE10 OK (it has touch events)
                var tempimg = $(item).attr('data-image').split('.jp');
                var imgURL = tempimg[0] + '_lo.jpg';
                $('.index_nav .backgrounds').append('<div class="indxBGimg" id="' + $(item).attr('id') + '_idx_img"  style="display:none;"><img src="' + imgURL + '" class="lo-res"></div>');
                
                var imgTag = $('#'+$(item).attr('id') + '_idx_img img');
                LoadDetails.setImageToLoad(imgTag.attr('src'));
;                imgTag.load(function(){
                   loaderProgress($(this).attr('src')); 
                });
            }
            // create the item, then give it an id
            var indexItem = $('<li>'+ $(item).text() +'</li>');
            indexItem.attr('id', $(item).attr('id')+'_idx');
            
            // append into 3 columns based on
            if(col1ul.children().length < columnHeight){
                col1ul.append(indexItem);
            } else if(col2ul.children().length < columnHeight){
                col2ul.append(indexItem);
            } else {
                col3ul.append(indexItem);
            }
        }
        
        
        // Set the close functionality when you click anywhere in the index but not a child
        $('.index_nav').click(function(e){
            $('.index_nav .close_btn').click();
        });
        
        // Set the close button functionality
        $('.index_nav .close_btn').click(function(e){
            e.stopPropagation();
            $('.index_nav').fadeOut(300);
            $('.navbtn.index').removeClass('open');
            
            if(_gaq != undefined)_gaq.push(['_trackEvent', 'Lions', 'Index', 'Close']);
            
        });


        
        // Hovering pulls up an image associated with each item - NO TOUCH - IE10 OK (it has touch events)
        if(!Modernizr.touch||$('html').hasClass('ie10')){
            $('.index_nav li').hover(function(e){
                //swapIndexImages( $(this).attr('id') );
                if($(this).attr('id') == 'about_idx')
                    $('.index_nav').addClass('opaque');
                else
                    $('#'+$(this).attr('id')+'_img').show();
                
            },function(e){
                if($(this).attr('id') == 'about_idx')
                    $('.index_nav').removeClass('opaque');
                else
                    $('#'+$(this).attr('id')+'_img').hide();

            });
        }
        // Set up click events on index items, deep links to content
        $('.index_nav li').click(function(e){
           e.stopPropagation();
           
           // load that slide !!
           loadSlide($(this).data('cID'))
           $('.index_nav .close_btn').click();
           if(_gaq != undefined)_gaq.push(['_trackEvent', 'Lions', 'Index', $(this).text()]);
           return false;    
        });
    }
    // Kick it off!
    createIndex();
    
    // load full res versions
    loadIndexFullRes = function(){
        $('.index_nav .backgrounds div').each(function(){
            var loRes = $('.lo-res', this);
            var tempimg = loRes.attr('src').split('_lo');
            var imgURL = tempimg[0] + '.jpg';
            $(this).append('<img src="'+imgURL+'" style="display: none;" class="full-res" width="'+ loRes.width() +'" height="'+ loRes.height() +'" >');
            $('.full-res',this).load(function(){
                $(this).width(loRes.width()).height(loRes.height());
                $(this).fadeIn(200, function(){
                    loRes.remove();
                });
            });
        });
        indexFullRes=true;
    }
    
    // Resize the images when resize event fires off
    resizeIndexImages = function(){
        var ratio = 1100 / 1920;
        var areaHeight = $(window).height();
        var areaWidth = $(window).width();
        var areaRatio = areaHeight / areaWidth;
        $('.index_nav .backgrounds div').width(areaWidth).height(areaHeight);
        
        // If the slide is taller than the dragarea, make the slide's width
        // equal to the dragarea's
        if( ratio >= areaRatio) {
            //set to height
            $('.index_nav .backgrounds img').width( areaWidth ).height( areaWidth * ratio );
        } else {
            $('.index_nav .backgrounds img').height( areaHeight ).width( areaHeight / ratio );
        }
    };
    
    // CHANGE INDEX IMAGE ON ROLLOVER OF A LINK
    swapIndexImages = function(itemID){
        
        var curImg = $('.index_nav .backgrounds .showing');
        var newImg = $('#'+itemID+'_img');
        
        if(newImg.length == 0){
            curImg.fadeOut(300).removeClass('showing');
            $('.index_nav').addClass('opaque');
            return;
        }
        
        // make sure it's on the top.
        newImg.css('z-index','20');
        curImg.css('z-index','1');
        
        // Fade it in
        newImg.fadeIn(300, function(){ curImg.hide().removeClass('showing'); newImg.addClass('showing'); $('.index_nav').removeClass('opaque'); });
    }
    
    // SORTING FUNCTION - DON'T TOUCH!!!!!!
    fisherYates = function() {
      var i = dataList.length, j, temp;
      if ( i === 0 ) return false;
      while ( --i ) {
         j = Math.floor( Math.random() * ( i + 1 ) );
         temp = dataList[i];
         dataList[i] = dataList[j]; 
         dataList[j] = temp;
       }
    }
    fisherYates();// SORT THAT STUFF
    
    
    // BUILD OUT THE SLIDES
    createSlides = function(){
        var dataLength = dataList.length;
        
        // SET DEEP LINK AS FIRST ITEM
        if(window.location.hash.length > 0){
            var hashID = window.location.hash.substr(2);
            var tempList = [];
            while(dataList.length > 0){
                var curItem = dataList.shift();
                if($(curItem).attr('id') == hashID){
                    isDeepLink = true;
                    tempList.unshift(curItem);
                } else {
                    tempList.push(curItem);
                }
            }
            
            while(tempList.length > 0){
                dataList.push(tempList.shift());
            }
        }
        $('#about').data('uID', 'about');
        if(hashID == 'about')isAboutLink = true;
        
        // Get each link and create a slide from it's content
        for(var i=0;i< dataLength;i++){
            // load each slide into dragarea
            var item = dataList[i];
            var slide = $('<section class="slide" id="' + $(item).attr('id') + '_sl" style="display: none;"></section>');
            slide.data('cID',i+2);
            slide.data('uID', $(item).attr('id'))
            
            // Load up all the content
            var loadFull = (i < 2||i == dataLength-1);
            slide.data('fullres',loadFull);
            loadContent( $(item).attr('id'), slide, loadFull );
            
            // Set the new id
            $('#'+item.attr('id')+'_idx').data('cID', i+2);
            
            // Make sure it's the right size
            setHeights(slide);
            
            // Add to the dragarea
            $('#dragarea').append(slide);
        }
        
        // Set up fullscreen functionality (Chrome, FF, and Safari only)
        $('.buttons li.fullscreen').each(function(){
            $(this).click(function(e){
                if($(this).hasClass('open')){
                    $(this).removeClass('open');
                    cancelFullscreen();
                } else {
                    $('.buttons li.fullscreen').addClass('open'); 
                    launchFullscreen(document.documentElement);
                }
            });
        });
        
        // Mute button functionality
        $('.buttons li.mute').each(function(){
            $(this).click(function(){
                if($(this).hasClass('open')){
                   $('.buttons li.mute').removeClass('open');
                   isMuted = false;
                } else {
                   $('.buttons li.mute').addClass('open');
                   isMuted = true;
                }
                checkMuteAudio();
            });
        });
        
        // Set up share functionality
        $('.buttons li.share').each(function(){
            $(this).click(function(){
                if($(this).hasClass('open')){
                    hideShareButtons();
                } else {
                    showShareButtons();
                    $(this).addClass('open');
                }
            });
        });
        setShareButtons();
    }
    
    loadContent = function(cID, slide, loadFull){
            var item = $('#'+cID+'_ct');
            
            var txtContent = $('.slideinfo',item).clone();
            txtContent.hide();
            
            var btnContent = $('#contentSlides .buttons').clone();
            
            var vidlink, imglink, audiolink, contentType, vidSrc, vidType, video;
            vidType = (BrowserDetect.browser == "Firefox") ? "video/ogg" : "video/mp4" ; 
            
            
            contentType = item.attr('data-type');
            $(slide).attr('type', contentType);
            $(slide).append(txtContent).append(btnContent);
            $(slide).prepend('<h2 class="title">' + $('h2', txtContent).text() + '</h2>');
            
            if($(item).attr('data-audio') != undefined){
                audiolink = $(item).attr('data-audio');
                $(slide).data('audio-url', audiolink);
                $(slide).data('audio-credit', $(item).attr('data-aud-cred'));         
            } else {
                // hide commentary
                $('.commentary', slide).hide();
            }


            // reset this variable
            if(contentType == 'video'){
                
                // No lo-res images
                slide.data('fullres',true);
                
                // hide the gallery buttons
                $('.gallerybtns-wrapper', slide).hide();
                
                // Set slide data
                $(slide).data('typetext','Video');
                $(slide).data('vid-mp4', $(item).attr('data-mp4')+'?t='+new Date().getTime()).data('vid-ogg', $(item).attr('data-ogg')+'?t='+new Date().getTime());
                
                // PRELOAD VIDEO
                //if(loadFull){
                    //vidSrc = (BrowserDetect.browser == "Firefox") ? $(slide).data('vid-ogg') : $(slide).data('vid-mp4');
                    video = document.createElement("video");
                    video.setAttribute("class", "bgvideo active");
                    video.setAttribute("style", "display: none;");
                    //video.setAttribute("src", vidSrc);
                    video.setAttribute("preload", "false");
                    video.setAttribute("loop", "true");
                    video.setAttribute("type", vidType);
                    $(video).data('ready',false);
                    $('h2.title', slide).after(video);
                //}
                
                // Wrap the image for use by fullscreen psuedo elements
                var imgWrap = $('<div class="img_wrapper" />');
                imgWrap.append('<img src="'+ $(item).attr('data-img') +'" width="1280" height="720">'); 
                
                LoadDetails.setImageToLoad($(item).attr('data-img'));
                  
                $('img', imgWrap).load(function(){
                    loaderProgress($(this).attr('src'))
                })
                $(slide).prepend(imgWrap);
                
                // Set up type for later usage
                $(slide).attr('type','video');
                
            } else if(contentType == 'gallery'||contentType == 'combo'){
                
                // set the number of slides
                var cLength = $('.images li',item).length;
                
                // hide there is only one image, no need for gallery buttons
                if(cLength == 1){
                    $(slide).data('fullres', true);// no lo-res to swap
                    $('.gallerybtns-wrapper', slide).hide();
                }
                
                // store the gallery data in teh slide
                $(slide).data('cLength', cLength).data('cCurrent',1);
                
                // Set the gallery pagination text
                $('.paginate .curslide',btnContent).text('1');
                $('.paginate .totslide',btnContent).text($('.images li',item).length);
                
                
                // Build gallery holder
                var galDiv = $('<div class="galleryholder" />');
                galDiv.css('position','relative');
                $(slide).data('typetext','Photo Gallery');
                
                // Store video data for combos slides
                if(contentType == "combo"){
                    $(slide).data('typetext','Video/Photo Gallery');
                    $(slide).data('vid-mp4', $(item).attr('data-mp4')+'?t='+new Date().getTime()).data('vid-ogg', $(item).attr('data-ogg')+'?t='+new Date().getTime());
                    
                    // PRELOAD VIDEO
                    //if(loadFull){
                        //vidSrc = (BrowserDetect.browser == "Firefox") ? $(slide).data('vid-ogg') : $(slide).data('vid-mp4');
                        video = document.createElement("video");
                        video.setAttribute("class", "bgvideo active");
                        video.setAttribute("style", "display: none;");
                        //video.setAttribute("src", vidSrc);
                        video.setAttribute("preload", "false");
                        video.setAttribute("loop", "true");
                        video.setAttribute("type", vidType);
                        $(video).data('ready',false);
                        galDiv.prepend(video);
                    //}
                    
                    
                }
                
                // Build out the gallery
                $('.images li',item).each(function(indx, image){
                    
                    var tempimg = $(image).text().split('.jp');
                    var imgURL = (indx == 0||loadFull) ? $(image).text() : tempimg[0] + '_lo.jpg';
                    var imgClass = (indx == 0||loadFull) ? 'full-res' : 'lo-res';
                    var giWrap = $('<div class="gi_wrapper" />');
                    var imgTag = $('<img src="' + imgURL + '" class="galleryimage ' + imgClass + '" data-imgID="'+ indx+1 +'" >');
                    if(indx == 0)giWrap.addClass('current');
                    
                    var capData = $('.captions li', item).eq(indx);
                    giWrap.data('caption',$('.caption',capData).text()).data('credit',$('.credit',capData).text());
                    
                    if(indx > 0){
                        perc = indx*99;
                        giWrap.css({'position': 'absolute', 'top':perc+'%', 'left':0 });
                    }
                    if(indx == 0){
                        $('.caption',txtContent).append('<p>'+ giWrap.data('caption') + '</p><p class="credit">' + giWrap.data('credit') + '</p>')
                    }
                    
                    giWrap.append(imgTag);
                    LoadDetails.setImageToLoad($(imgTag).attr('src'));
                    
                    $(imgTag).load(function(){
                        loaderProgress($(imgTag).attr('src'));
                    })
                    galDiv.append(giWrap);
                });
                
                // Wrap the gallery and add it to the DOM
                galDiv.wrap('<div class="gallerywrapper" />');
                $(slide).prepend('<div class="gallerywrapper" />');
                $('.gallerywrapper', slide).append(galDiv);
                
                // Set up the gallery buttons
                setGalleryControls($(slide));
            } else {
                // This slide doesn't have a type
                $(slide).attr('type','other');
            }

            // Set up audio controls
            if(audiolink)setAudioControls($(slide), audiolink);
            
            // Size and position the info box from the right side.
            $('.slideinfo', slide).css({'right':'-471px', 'height': $(window).height() - $('.global-header').height() });
            $(slide).click(function(e){
                if(e.originalEvent != undefined && !$(e.originalEvent.target).hasClass('share') && $('.slide.current .share').hasClass('open'))hideShareButtons();
                if($('.slide.current .infobtn').hasClass('open') ){
                
                    if($(e.originalEvent.target).hasClass('slideinfo') || $(e.originalEvent.target).parents('.slideinfo').length > 0)return;
                    if($(e.originalEvent.target).hasClass('buttons') || $(e.originalEvent.target).parents('.buttons').length > 0)return;
                
            
                    $('.slide.current .infobtn').click();
                }
        
            });
            
            // Size the scrollable text area inside the info box.
            $('.slideinfo .infotext', slide).css('height', Math.round($('.slideinfo', slide).height() - 300)+'px');
            
            // set up the infobox to close on click
            $('.buttons li.infobtn', slide).click(function(){
                if($(this).hasClass('open')){
                    $(this).text('Caption');
                    $(this).removeClass('open');
                    var newPos = -$('.slideinfo', slide).width();
                    $('.slideinfo', slide).animate({'right': '-471px'}, 500, function(){ $('.slideinfo', slide).hide(); });
                    //$('.navbtn.index').fadeIn(750);
                    if(_gaq != undefined)_gaq.push(['_trackEvent', 'Lions', 'Caption', 'Close']);
                } else {
                    $(this).addClass('open');
                    $(this).text('Close');
                    $('.slideinfo', slide).show();
                    $('.slideinfo', slide).animate({'right': '0'}, 500)
                    //$('.navbtn.index').fadeOut(250);
                    if(_gaq != undefined)_gaq.push(['_trackEvent', 'Lions', 'Caption', 'Open']);
                }
            });
        }
    
    // Just like it sounds - triggers the fullscreen
    launchFullscreen = function(element) {
      if(element.requestFullScreen) {
        element.requestFullScreen();
      } else if(element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if(element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen();
      }
    }
    
    // Just like it sounds - triggers the cancel fullscreen
    cancelFullscreen = function() {
      if(document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if(document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if(document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
    }
    
    
    // Slide up the services buttons - Google, Twitter, Facebook
    showShareButtons = function(){
        $('.services').show();
        $('.services').animate({'height': '105px'}, 300, "easeOutSine");
    }
    
    // Slide down the services buttons
    hideShareButtons = function(doNow){
        if(doNow){
            $('.services').animate({'height': '0px'}, 100, "easeOutSine");
            $('.slide.current li.share').removeClass('open');
        } else {
            $('.services').animate({'height': '0px'}, 300, "easeOutSine", function(){
                $('.slide.current li.share').removeClass('open');
            });
        }
    }
    
    // Set the information for each service based on the deep link (hashtag)
    setShareButtons = function(){
        
        var shareURL = 'http://ngm.com/serengeti-lion';
        
        $('.services .google').click(function(){
            window.open('https://plus.google.com/share?url='+shareURL, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');
            hideShareButtons();
        });
        
        $('.services .twitter').click(function(){
            window.open(
                  'https://twitter.com/share?url='+shareURL+'&via=NatGeo&hashtags=NatGeoLions', 
                  '', 
                  'width=626,height=436');
                  hideShareButtons();
        });
        
        $('.services .facebook').click(function(){
            window.open(
                  'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(shareURL), 
                  '', 
                  'width=626,height=436');
                  hideShareButtons();
        });
        
    }
        
    setGalleryControls = function(target){
        $('.uparrow', target).click(function(e){
            galleryChange('up');
            if(_gaq != undefined)_gaq.push(['_trackEvent', 'Lions', 'Gallery', 'Gallery_up']);
        });
        
        $('.downarrow', target).click(function(e){
            galleryChange('down');
            if(_gaq != undefined)_gaq.push(['_trackEvent', 'Lions', 'Gallery', 'Gallery_down']);
        });
    }
    
    setAudioControls = function(target, media){
        // show Commentary button
        $(target).append('<div class="audio_credit">'+ $(target).data('audio-credit') +'</div>');
        $('.commentary', target).click(function(e){
            var container = $(this);
            if($(container).data('init') && !$(container).hasClass('open')){
                if(_gaq != undefined)_gaq.push(['_trackEvent', 'Lions', 'Commentary', 'Start']);
                // This only happens if the user has not navigated away from the slide them came back
                $(container).animate({'width': '190'}, 300, "easeOutSine");
                $('.mejs-audio', container).animate({'right': 0}, 200, "easeOutSine", function(){ 
                    $('#audioplayer-'+$(target).attr('id'))[0].play();
                    $(container).addClass('open').css('overflow','visible');; 
                    checkMuteAudio();
                });
            } else {
                if(_gaq != undefined)_gaq.push(['_trackEvent', 'Lions', 'Commentary', 'Start']);
                // Load the new player upon entry of the slide
                $('#audioplayer-'+$(target).attr('id')).attr('src',$('.slide.current').data('audio-url')).mediaelementplayer({
                    alwaysShowControls: true, 
                    features: ['playpause','progress','current','duration'], 
                    audioWidth: 190, 
                    audioHeight: 35, 
                    success: function (mediaElement, domObject) {
                        $(container).data('init',true); 
                        var mainDiv = $('.slide.current .mejs-container');
                        $(mainDiv).append('<div class="closebtn"></div>');
                        
                        $(mediaElement).on('ended', function(e){
                            $('.closebtn',mainDiv).delay(200).click();
                        });
                        
                        $('.closebtn',mainDiv).click(function(e){
                            mediaElement.pause();
                            hideAudioCredit();
                            $(container).css('overflow','hidden');
                            $(container).animate({'width': 150}, 100, "easeOutSine", function(){
                                $(container).removeClass('open');
                                checkMuteAudio();
                            });
                            $(mainDiv).animate({'right': -190}, 300, "easeOutSine");
                            if(_gaq != undefined)_gaq.push(['_trackEvent', 'Lions', 'Commentary', 'Stop']);
                            e.stopPropagation();
                        });
                        
                        // animate the player into view
                        $(container).animate({'width': 190}, 300, "easeOutSine");
                        $(mainDiv).animate({'right': 0}, 300, "easeOutSine", function(){ 
                            mediaElement.play();
                            showAudioCredit();
                            $(container).addClass('open').css('overflow','visible');
                            checkMuteAudio();
                        });
                        
                    } 
                });
                
            }
        });     
    }
    
    showAudioCredit = function(){
        audioCredit = true;
        var itemPos = $('.slide.current .audio_credit').height();
        $('.slide.current .audio_credit').css('bottom',-30).animate({"bottom": 36}, 750, "easeOutSine", function(){
            $('.slide.current .audio_credit').delay(3000).animate({'bottom': -30}, 1000, "easeOutSine", function(){ audioCredit = false; });
        });
    }
    
    hideAudioCredit = function(){
        $('.slide.current .audio_credit').stop(true,true).animate({'bottom': -30}, 300, "easeOutSine", function(){ audioCredit = false; });
    }
    
    // Check to see if global mute button is set
    checkMuteAudio = function(){
        var audVol = (isMuted) ? 0 : 1;
        var vidVol = (isMuted) ? 0 : ($('.slide.current .commentary').hasClass('open')) ? 0.07 : 1;
        try { $('.slide.current video')[0].volume = vidVol; } catch(err) {}
        try { $('.slide.current audio')[0].volume = audVol; } catch(err) {}
    }
    
    // Resizes gallery images as needed for screen resizing, etc.
    fixGalleries = function(slide){
        var element = $('.slide.current .gi_wrapper.current');
        var elementPosition = element.position();
        
        if($('.galleryholder .gi_wrapper', slide).length != 0){
            $('.galleryholder', slide).css('top', -elementPosition.top);
        }
    }
    
    loadNextSlide = function(){
        lastLoadedItem++;
        if(lastLoadedItem == dataList.length+2)return;
        var slide = $('.slide').eq(lastLoadedItem);
        
        //prepVideoContent(slide);
        loadGalleryFullRes(slide);
    }
    
    // Get the fullres versions of the lesser gallery images
    loadGalleryFullRes = function(slide){
        if(slide.data('fullres')){
            loadNextSlide();
            return;
        }
        
        fullResToLoad = 0;
        fullResLoaded = 0;
        
        $('.gi_wrapper',slide).each(function(indx, image){
            if(indx == 0)return true;
            
            fullResToLoad++;
            
            var loRes = $('.lo-res',this);
            var tempimg = loRes.attr('src').split('_lo');
            var imgURL = tempimg[0] + '.jpg';
            $(this).append('<img src="'+imgURL+'" style="display: none;" class="galleryimage full-res" width="'+loRes.width()+'" height="'+ loRes.height()+'" >');
            $('.full-res',this).load(function(){
                fullResLoaded++;
                $(this).width(loRes.width()).height(loRes.height());
                $(this).fadeIn(200, function(){
                    loRes.remove();
                });
                if(fullResLoaded == fullResToLoad){
                    loadNextSlide();
                }
            });
        });
        $(slide).data('fullres', true);
    }
    
    // Change the gallery slide up or down
    galleryChange = function(dir){
        
        if($('.navbtn.about').hasClass('open') || slideTitleScreen)return;
        
        var isUp = (dir == "up");
        var cCurrent = $('.slide.current').data('cCurrent');
        
        //$('.slide.current .gallerylabel').hide();
        $('.slide.current .gallerylabel').stop(true,true).height(27).animate({'bottom': -64}, 300, "easeOutSine");
        
        var cType = $('.slide.current').attr('type');
        if(cType != "gallery"&&cType != "combo")return;
        
        if(isTweening)return;
        
        isTweening = true;
        
        var container = $('.slide.current .gallerywrapper .galleryholder');
        var containerPosition=$(container).position();
        
        // Fire off a trasition to get Firefox warmed up
        if( BrowserDetect.browser == 'Firefox' && cCurrent == 1 ){
            $(container).stop().transition({ top:containerPosition.top },10,"out",function(){});
        }
        
        var nextSlideNum;
        if(isUp){
            nextSlideNum = (cCurrent == 1) ? $('.slide.current').data('cLength') -1: cCurrent-2;
        } else {
            nextSlideNum =  (cCurrent == $('.slide.current').data('cLength')) ? 0 : cCurrent;
        }
        
        $('.preloader').fadeOut(200);
        
        if(slideTitleScreen && nextSlideNum != 1){

        }
        
        var element = $('.slide.current .galleryholder .gi_wrapper').eq(nextSlideNum);
        var elementPosition=element.position();
        
        // Clean up the data and set the pagination text
        
        if(isUp){
            if(cCurrent == 1)
                cCurrent = $('.slide.current').data('cLength');
            else 
                cCurrent--;
                
        } else {
            if(cCurrent == $('.slide.current').data('cLength'))
                cCurrent = 1;
            else
                cCurrent++;
        }
            
        $('.slide.current').data('cCurrent',cCurrent);
        $('.slide.current .paginate .curslide').text(cCurrent);
        $('.slide.current .caption').html('<p>'+element.data('caption')+'</p><p class="credit">'+element.data('credit')+'</p>')
        
        //slide it 
        $('.slide.current .galleryholder .gi_wrapper').removeClass('current');
        
        // set video on top to fix overlap if showing, else it allows the next image to be on top
        if(cCurrent == 1){
            //$('.slide.current .bgvideo').addClass('active');
        } else { 
            element.addClass('current');
            $('.slide.current .bgvideo').removeClass('active');
         }  
          
          if( Modernizr.csstransforms && Modernizr.csstransitions ){
              $(container).stop().transition({ top:-elementPosition.top },600,"ease-in-out",function(){ isTweening=false; checkPreloaderStatus(); if(cCurrent == 1){ $('.slide.current .bgvidedo').addClass('active');} });
          } else { 
              $(container).animate({ top:-elementPosition.top }, 600, 'easeOutSine', function(){ isTweening=false; checkPreloaderStatus(); if(cCurrent == 1){ $('.slide.current .bgvidedo').addClass('active');} });
          }  
    }
    
    checkPreloaderStatus = function(){
        if($('.slide.current video').length == 0 || $('.slide.current video').attr('src') == undefined)return;
        if($('.slide.current video')[0].networkState == 2 && $('.slide.current').data('cCurrent') == 1){ 
            //console.log('show preloader');
            //$('.preloader').show(); 
        }
    }
    
    // Set slide back to default settings
    closeOutSlide = function(){
        // cancel video load events
        $('.slide.current video').off('loadstart canplay');
        
        if(($('.slide.current video').length != 0 && $('.slide.current video').attr('src') != undefined)||$('.slide.current').attr('id') == 'entry'){
            $('.slide.current video')[0].pause();
            //$('.slide.current video')[0].currentTime = 0; // Set it back to the beginning
        }
        
        // CLOSE COMMENTARY AND REMOVE AUDIO CONTROLS AND TAG
        autoPlayAudio = false;
        if($('.slide.current .commentary').hasClass('open'))$('.slide.current .commentary .closebtn').click();
        $('.slide.current .commentary').data('init', false);
        $('#audioplayer-'+$('.slide.current').attr('id')).remove();
        $('.mejs-container').remove();
        
        // close out buttons and info boxes
        if($('.slide.current .share').hasClass('open'))hideShareButtons(true);
        if($('.slide.current .infobtn').hasClass('open'))$('.slide.current .infobtn').click();
    }
    
    resetPreviousSlide = function(){
        var slide = $('.slide.previous');
        var cType = slide.attr('type');
        // completely remove the entry screen, there's no going back anyway.
        if(slide.attr('id') == 'entry'){
            $('video', slide).remove();
            return;
        }
        
        if($('audio',slide).length > 0){
            $('audio',slide)[0].pause();
            $('.mejs-container',slide).remove();
        }
        
        if($('video',slide).length != 0)$('video', slide).attr('src','').hide(); // remove all previous videos to save memory
        
        if(slide.attr('type') != 'video'){
            slide.data('cCurrent', 1);
            $('.galleryholder', slide).css('top', 0);
            $('.gi_wrapper', slide).removeClass('current');
            $('.gi_wrapper', slide).eq(0).addClass('current');
            $('video', slide).addClass('active');
            $('.paginate .curslide', slide).text('1');
        }
        
    }

    
    // Go to the bucket on the left
    changeLeft = function(){
        
        if(isTweening||$('.navbtn.about').hasClass('open'))return;
        
        // cancel out current slide events/displays
        closeOutSlide();
        // Set next slide
        if($('.slide.current').data('cID') == 2||$('.slide.current').attr('id') == "entry"){
            currentSlide = dataList.length;
            $('.bottomNavBar').animate({bottom: -35}, 200);
            $('.slide.current').removeClass('current').addClass('previous').find('h2.active').removeClass('active');
            $('#' + $(dataList[currentSlide-1]).attr('id') + '_sl').addClass('current');

            
        } else  {
            currentSlide--;
            $('.slide.current').addClass('previous').find('h2.active').removeClass('active').end().removeClass('current').prev().addClass('current');
            
        }
        
        // set address for next slide
        var addressVal = $('.slide.current h2.title').text().toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'');
        if($('.slide.current').attr('id') == 'about')addressVal = 'about';
        $.address.value(addressVal); 
        
        // show slide, pass direction
        showSlide(-1);
    }
    
    // Go to the bucket on the right
    changeRight = function(){
        if(isTweening||$('.navbtn.about').hasClass('open'))return;
        
        // cancel out current slide events/displays
        closeOutSlide();
        
        // set the next slide
        if(currentSlide == dataList.length){
            currentSlide = 2;
            $('.slide.current').removeClass('current').addClass('previous').find('h2.active').removeClass('active');
            $('.slide').eq(currentSlide).addClass('current').find('h2.active').addClass('active').end();
        } else {
            currentSlide++;
            $('.slide.current').addClass('previous').removeClass('current').find('h2.active').removeClass('active').end().next().addClass('current');
        }
        
        // set the address for the slide
        var addressVal = $('.slide.current h2.title').text().toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'');
        if($('.slide.current').attr('id') == 'about')addressVal = 'about';
        $.address.value(addressVal); 
        
        // Show slide, pass a direction
        showSlide(1);
    }    
    
    // Load a specific slide, based on id
    loadSlide = function(cID){
        if(isTweening)return;
        if($('.slide.current video').length != 0 && $('.slide.current video').attr('src') != undefined)$('.slide.current video')[0].pause();
        
        closeOutSlide();
        
        
        currentSlide = cID-1;
        lastLoadedVideo = cID;
        
        $('.slide.current').removeClass('current').addClass('previous').find('h2.active').removeClass('active');
        $('.slide').eq(cID).addClass('current');
        var addressVal = $('.slide.current h2.title').text().toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'');
        if($('.slide.current').attr('id') == 'about')addressVal = 'about';
        $.address.value(addressVal); 
        showSlide(1);
    }
    
    // Transitions and fades to surface the content
    showSlide = function(direction, isIntro){
        
        lastDirection = direction;
        slideTitleScreen = true;
        
        if($('.slide.previous audio').length > 0){
            $('.slide.previous audio')[0].pause();
            $('.slide.previous .mejs-container').remove();
        }
        
        if(!fullResLoading)loadNextSlide();// Kicks off the process of loading all the rest of the pages. 
        
        var slide = $('.slide.current');
        checkMuteAudio();
        
        // reset globals
        $('.preloader').hide();
        videoLoading = false;
        clearTimeout(titleTimeout);
        
        setHeights(slide);
        
        // GET FULL RES IMAGES FOR GALLERIES
        if(!slide.data('fullres')){
            loadGalleryFullRes(slide);
        }
        var slideTitle =  (slide.attr('id') == 'about') ? 'About' : $('h2.title', slide).text() + '&nbsp;&nbsp;<span>' + slide.data('typetext') + '</span>'
        
        if(slide.attr('id') == 'entry'){
            $('#introvid')[0].play();
            killNav();
        } else {
            //$('.curtitle').addClass('tweening', 250, function(){ $('.curtitle').html( slideTitle ) })
            startNav(true);
        }
        
        isTweening = true;
        var startPos;
        var prevEndPos; 
        var isEntry = false;
        
        if(direction == -1){
            // move them left
            startPos = '-100%';
            prevEndPos = '100%';
            slide.css({'left':startPos, 'z-index':'999'}).show();
            
        } else if(direction == 1 && $('.slide.previous').attr('id') == 'entry'){
            
            startPos = '100%';
            prevEndPos = '-100%';
            slide.css({'top':startPos, 'left': 0, 'z-index':'200'}).show();
            isEntry = true;
            $('.slide.previous .bottomNavBar').delay(1000).animate({bottom: -35}, 200);
            
        } else {
            // move them right
            startPos = '100%';
            prevEndPos = '-100%';
            slide.css({'left':startPos,'z-index':'200'}).show();
        }
        
        // Set bottom bar out of site
        $('.slide.current .bottomNavBar').css('bottom','-35px');
        
        if($('.slide.current').attr('type') != 'video' && $('.slide.current').data('cCurrent') == 1){
            $('.slide.current .gallerylabel').css('bottom', '-60px');
        }
        // TITLE FADE AND TRANSITION
        
            //$('.slide.previous').animate({ top: prevEndPos}, 450, 'easeInOutSine');
        
        if( Modernizr.csstransforms && Modernizr.csstransitions ){
            if(isEntry){
                $('#entry .introtxt').removeClass('active');
                $('.slide.current').stop().delay(300).transition({ top:0 },600,"ease-out",function(){ isTweening=false; cleanUp(); setTimeout(startContent, 300); });
            } else {
                $('.slide.previous .gallerylabel').stop().transition({bottom: -35}, 100, "ease-in");
                $('.slide.previous .bottomNavBar').stop().transition({ bottom: -40}, 200, "ease-in", function(){
                    $('.slide.current').stop().transition({ left:0 },800,"ease-in-out",function(){ 
                        isTweening=false; 
                        cleanUp(); 
                        setTimeout(startContent, 300);
                        $('.slide.current h2.title').addClass('active');
                    
                    });
                });
            }
        } else {
            if(isEntry){
                $('.slide.current').animate({ top: 0}, 1000, 'easeOutSine', function(){ isTweening=false; cleanUp(); setTimeout(startContent, 300); }); 
            } else {
                $('.slide.previous .gallerylabel').stop().animate({bottom: -35}, 100, "easeInSine");
                $('.slide.previous .bottomNavBar').stop().animate({ bottom: -40}, 200, "easeInSine", function(){
                    $('.slide.current').css('left', startPos).animate({ left: 0}, 1000, 'easeOutSine', function(){ 
                        isTweening=false; 
                        cleanUp(); 
                        setTimeout(startContent, 300); 
                        $('.slide.current h2.title').addClass('active');
                    });
                });
            }
        }
        
        if(slide.attr('type') != 'video')fixGalleries(slide);
        
        $('.index_nav ul li').removeClass('current');
        $('#'+slide.data('uID')+'_idx').addClass('current').addClass('visited');
        
    }
    
    // Similar to close out
    cleanUp = function(){
        resetPreviousSlide();
        
        $('.slide').each(function(indx, elem){
            $(elem).css('z-index',indx);
            $('h2.title', elem).show();
            $(elem).removeClass('previous');
            if($(this).hasClass('current'))return;
            $(elem).hide();
        });
        
    }
    
    
    preloadNextVideo = function(){
        if(allVideosPreloaded)return;
        
        lastLoadedVideo++; 
        
        if( lastLoadedVideo >= dataList.length+2){
            lastLoadedVideo = 4;
        }
        var needsVid = false;
        var slide;
        var tries = 0;
        while(needsVid == false && tries < 26){
            slide = $('.slide').eq(lastLoadedVideo);
            if($('video', slide).length == 0 && (slide.attr('type') == 'video' || slide.attr('type') == 'combo')){
                needsVid = true;
            } else {
                lastLoadedVideo++;
                if( lastLoadedVideo >= dataList.length+2 || lastLoadedVideo == Math.abs('a' *1)){
                    lastLoadedVideo = 4;
                }
                tries++;
            }
        }
        
        if(needsVid == false && tries == 26){
            allVideosPreloaded = true;
            return;
        }
        prepVideoContent(slide);
        
    }
    
    preloadPreviousVideo = function(){
        if(allVideosPreloaded)return;
        
        lastLoadedVideo--;
        
        var needsVid = false;
        var slide;
        if( lastLoadedVideo < 4 || lastLoadedVideo == Math.abs('a' *1)){
            lastLoadedVideo = dataList.length+1;
        }
        var tries = 0;
        while(needsVid == false && tries < 26){
            slide = $('.slide').eq(lastLoadedVideo);
            if($('video', slide).length == 0 && (slide.attr('type') == 'video' || slide.attr('type') == 'combo')){
                needsVid = true;
            } else {
                lastLoadedVideo--;
                if( lastLoadedVideo < 4 || lastLoadedVideo == Math.abs('a' *1)){
                    lastLoadedVideo = dataList.length+1;
                }
                tries++;
            }
        }
        if(needsVid == false && tries == 26){
            allVideosPreloaded = true;
            return;
        }
        prepVideoContent(slide);
        
    }
    prepVideoContent = function(slide){
        var cType = $(slide).attr('type');
        if(cType == 'gallery'|| $('video',slide).length > 0)return;
        
        var vidSrc = (BrowserDetect.browser == "Firefox") ? $(slide).data('vid-ogg') : $(slide).data('vid-mp4');
        var vidType = (BrowserDetect.browser == "Firefox") ? "video/ogg" : "video/mp4" ; 
        var video = document.createElement("video");
        
        video.setAttribute("class", "bgvideo active");
        video.setAttribute("src", vidSrc);
        video.setAttribute("preload", "false");
        video.setAttribute("loop", "true");
        video.setAttribute("type", vidType);
        video.setAttribute("style","display: none;");
        
        if(cType == 'video'){
            $('h2.title', slide).after(video);
        } else if(cType == 'combo'){
            $('.galleryholder', slide).prepend(video);
        }
    }
    
    // Play the video, set up the audio for the slide
    startContent = function(){
        // Add the audio tag if the slide has an audio url associated
        if($('.slide.current').data('audio-url') != undefined && $('.slide.current audio').length === 0){
            
            var audio = document.createElement("audio");
            audio.setAttribute("id", "audioplayer-"+ $('.slide.current').attr('id'));
            audio.setAttribute('preload', 'false');
            audio.setAttribute('type', 'audio/mpeg');
            $('.slide.current .commentary').append(audio); 
         }
         
         // Set the type variable for future reference
         var cType = $('.slide.current').attr('type');
         if(cType == 'about')return;
        
         videoLoading = true;
         
         // GALLERIES
         if(cType != 'gallery'){
             
            // CHECK TO SEE IF IT HAS A VIDEO (COMBO)
            if($('.slide.current video').attr('src') == undefined || $('.slide.current video').attr('src') == ''){
                //console.log('INDEX JUMP -- LOADING CONTENT');
                var vidSrc = (BrowserDetect.browser == "Firefox") ? $('.slide.current').data('vid-ogg') : $('.slide.current').data('vid-mp4');
                $('.slide.current video').attr('src', vidSrc);
                $('.slide.current video').on('canplay',function(){ videoLoading = false; startVideo(); });
                // Should be playing
            }
        } else {
            setTimeout(function(){ $('h2.title',slide).removeClass('active') }, 3000);
            startAudioCommentary();
        }
                
    }
    
    // COUNTDOWN TIL ARROWS HIDE
    checkNavTimeout = function(){
        if(debug){
            clearInterval(navTimeoutInt)
            return;
        }
        
        if( videoLoading || navHover || audioCredit )return;
        navtimeout--;
        if(navtimeout == 0){
            killNav();
            clearInterval(navTimeoutInt)
        }
    }






    // HIDE NAV
    killNav = function(){
        clearInterval(navTimeoutInt);
        $('.navbtn.leftarrow, .navbtn.rightarrow, .navbtn.index, .navbtn.about, .bottomNavBar, .services, .audio_credit').fadeOut();
        
        navActive = false;
        
        $('.bottomNavBar').off('hover');
        $(document).off('mousemove click touchend');
        $(document).on('mousemove click touchend', function(e){
            if(!navActive)startNav();
        });
    }
    
    // BEGIN TRACKING NAV
    startNav = function(clean){
        clearInterval(navTimeoutInt)
        
        navtimeout = 4;// number of seconds until 
        if($('.slide.current').attr('id') != 'entry'){
            //$('.navbtn.leftarrow, .navbtn.rightarrow, .navbtn.index, .navbtn.about, .curtitle, .bottomNavBar, .services').fadeIn();
            $('.navbtn.leftarrow, .navbtn.rightarrow, .navbtn.index, .navbtn.about, .bottomNavBar, .services, .audio_credit').fadeIn();
        } else {
            $('.bottomNavBar').fadeIn();
        }
        
        
        navActive = true;
        navTimeoutInt = setInterval(checkNavTimeout, 1000);
        $('.bottomNavBar').hover(function(e){ navHover = true; },function(e){ navHover = false; });
        $(document).off('mousemove click touchend').off('click');
        $(document).on('mousemove click touchend',function(e){
           navtimeout = 4;
        });
        
    }
    
    // Clicking play button on videos
    startVideo = function(){
        var vid = $('.slide.current video')[0];
        if(vid.readyState < 3){
            $(vid).hide();
            $('.preloader').fadeIn(300);
            $(vid).on('canplay', function(){
                $(vid).show();
                $('.preloader').fadeOut(200);
                $(vid).off('canplay');
            })
        } else {
            $(vid).show();
        }
        vid.play();
        
        $('.slide.current .bottomNavBar').delay(500).animate({ bottom: 0 },"slow", function(){ 
            $('.slide.current h2.title').delay(6000).removeClass('active');
            $('.navbtn.about').fadeIn(200);
            if($('.slide.current').attr('type') != 'video' && $('.slide.current').data('cCurrent') == 1){
                $('.slide.current .gallerylabel').animate({bottom: 0}, "easeOutSine");
            }
        });
        
    }
    
    // Clicking listen button on galleries
    startAudioCommentary = function(){
        $('.slide.current .bottomNavBar').animate({ bottom: 0 },"slow", function(){ 
            $('.navbtn.about').fadeIn(200);
            $('.slide.current .commentary').click()
            if($('.slide.current').attr('type') != 'video' && $('.slide.current').data('cCurrent') == 1){
                $('.slide.current .gallerylabel').animate({bottom: 0}, "easeOutSine");
            }
        });
    }
    
    // LOADERBAR PROGRESS
    loaderProgress = function(itemURL){
        var loadPercent = LoadDetails.setAsLoaded(itemURL);
        $('.siteLoader .head_text.light .txt_holder').width(loadPercent+'%');
    }
    
    // PRELOAD IMAGES
    $(window).load(function(){
        $('.preloader').hide();
        
        $("#entry .bottomNavBar").delay(3200).animate({ bottom:'+=35px' },"slow");
        $(".quoteblock").delay(1300).fadeIn("slow");
        $(".explorebtn").delay(2400).fadeIn("slow");
        
        if(isDeepLink){
            $('.explorebtn').click();
            $('.siteLoader').delay(1000).fadeOut(350);
        } else if(isAboutLink){
            changeLeft();
            $('.siteLoader').delay(1000).fadeOut(350);
        }else {
            $('#entry video')[0].play()
            $('.siteLoader').fadeOut(350);
        }
    });
    
    
    // Show/Hide buttons based on user interaction
    if(!debug){
    $(document).hover(function(e){
        // show buttons 
        if(!navActive)startNav();
    },function(e){
        //hide buttons
        if(navActive)killNav();
        hideAudioCredit();
    });
}
    // TRIGGER WHEN VIDEO IS LOADED
    $(document).delegate('video', 'DOMNodeInserted', function () {
        $(window).trigger('resize');
        checkMuteAudio();
        //$('.slide.current video').trigger('play');
    });
    
    // WINDOW FULLSCREEN MODE
    $(window).on('webkitfullscreenchange mozfullscreenchange fullscreenchange',function(e){ 
        if($('html').hasClass('fs-active')){
            $('html').removeClass('fs-active');
            $('.fullscreen').removeClass('open');
        } else {
            $('html').addClass('fs-active');
            $('.fullscreen').addClass('open');
        }
        $(window).trigger('resize'); 
    });
    
    
    // CALLED BY RESIZE FUNCTION
    setHeights = function(target){
        var vid_ratio = 1080 / 1920;
        var gallery_ratio = 1067 / 1600;
        
        var areaHeight = $( '#dragarea_container' ).height();
        var areaWidth = $( '#dragarea_container' ).width();
        var areaRatio = areaHeight / areaWidth;
        var slide = target||$('.slide.current');
        $(slide).height(areaHeight).width(areaWidth);
        var cType = $(slide).attr('type');
        
        $('.gi_wrapper, .img_wrapper',slide).height( areaHeight ).width( areaWidth );
        
        
        // Wrangling fullscreen images and video into full-frame mode
        if($('html').hasClass('fs-active')){
            var vH =  Math.round(100*((areaWidth * vid_ratio)/areaHeight));
            var mPerc = (100 - vH)/2
            var newW;
            
            // Does the video fit in the height at full width? 
            if((vid_ratio * areaWidth) > areaHeight){
                // too tall, set to height 100%, with auto
                $('video',slide).css({'top': 0, 'left': 0}).addClass('tall');
                newW = Math.abs( (areaWidth-Math.round(areaHeight / vid_ratio) )/2);
                if(cType == 'video'||cType == 'intro'){
                    $('video',slide).css('left', newW);
                    $('img', slide).css({'top': 0, 'left': newW}).addClass('tall');
                } else {
                    $('video',slide).css('margin-left', newW);
                }
            } else {
                // fits fine at full-width ( reset in case this is a resize )
                $('video',slide).css({'top': mPerc+'%', 'left':0 }).removeClass('tall');
                if(cType == 'video')$('img', slide).css({'top': mPerc+'%', 'left': 0}).removeClass('tall');
            }
            
            // Do the gallery images fit in the height at full-width?
            $('.galleryimage',slide).each(function(indx, elem){
                var ratio = (cType == 'combo'&&indx == 0) ? vid_ratio : gallery_ratio;
                if((ratio * areaWidth) > areaHeight){
                    // too tall, set to height 100%, with auto
                    newW = Math.abs( (areaWidth-Math.round(areaHeight / ratio) )/2);
                    $(this).addClass('tall').css({'top': 0, 'left': newW}); 
                } else {
                    // fits fine at full-width ( reset in case this is a resize )
                    newW = Math.abs( (areaHeight-Math.round(areaWidth * ratio) )/2);
                    $(this).removeClass('tall').css({'top': newW, 'left': 0});
                }
            });
            
            $('.slideinfo', slide).css('height',$(window).height() - $('.global-header').height());
            $('.slideinfo .infotext', slide).css('height', Math.round($(this).parent().height() - 300)+'px');
            $('#about-text').height($('#dragarea').height()-73);
            return;// don't try to size the images again
        }
        
        $('video',slide).css({'left': 0, 'top': 0, 'margin': 0}).removeClass('tall');
        // ( reset in case this is a resize )
        if(cType == 'video'||cType == 'intro')$('img',slide).css({'margin-left': 0, 'top': 0, 'left': 0}).removeClass('tall');
        
        // check the ratios and size accordingly
        if( vid_ratio >= areaRatio) {
            //set to height
            var vHt = areaWidth * vid_ratio;
            var vDiff = Math.round( (vHt-areaHeight)/2 );
            $( 'video', slide).width( areaWidth ).height( vHt ).css({'top':-vDiff, 'left': 0});
            
            if(cType == 'video')$('img', slide).width( areaWidth ).height( vHt ).css({'top':-vDiff, 'left': 0});
            
        } else {
            var vWdt = areaHeight / vid_ratio;
            var vDiff = Math.round( (vWdt - areaWidth)/2 );
            
            $( 'video', slide).height( areaHeight ).width( vWdt ).css({'left': -vDiff, 'top': 0});
            if(cType == 'video')$('img', slide).height( areaHeight ).width( vWdt ).css({'left': -vDiff, 'top': 0});
        }
        
        // set gallery image
        $('.galleryimage',slide).each(function(indx, elem){
            $(this).removeClass('tall').css('margin-left', 0);
            
            var ratio = (cType == 'combo'&&indx == 0) ? vid_ratio : gallery_ratio;
            
            // first image in a combo is a video first-frame, thus vid_ratio
            if(ratio >= areaRatio){
                var iHt = areaWidth * ratio;
                var iDiff = Math.round( (iHt-areaHeight)/2 );
                
                $(elem).width( areaWidth).height( iHt ).css({'top':-iDiff, 'left': 0});
            } else {
                var iWdt = areaHeight / ratio;
                var iDiff = Math.round( (iWdt-areaWidth)/2);
                $(elem).height( areaHeight ).width( iWdt ).css({'left':-iDiff, 'top': 0});
            }
        });
        
        // set the infobox
        $('.slideinfo', slide).css('height',$(window).height() - $('.global-header').height());
        $('.slideinfo .infotext', slide).css('height', Math.round($(this).parent().height() - 300)+'px');
        $('#about-text').height($('#dragarea').height()-73);
    }
    
    $(window).on('resize',function(e){
        $('#dragarea_container').height($(window).height() - $('.global-header').height()).width($(window).width());
        $('#about').width($('#dragarea_container').width()).height($('#dragarea_container').height())
        
        var loadTop; 
        if($('.slide.current').attr('id') == 'entry'){
            loadTop = Math.round($('#entry .introtxt').position().top + 254);
        } else {
            loadTop = $('.leftarrow').position().top + 110;
        }
        $('.siteLoader h1').fadeIn(300);
        //$('.preloader').css('top', loadTop);
        
         $('.index_nav').css({'height': $(window).height(), 'width':'100%' });
        resizeIndexImages();
        
        setHeights();
        if($('.slide.current').attr('type') != 'video')fixGalleries($('.slide.current'));
        
    });
    
    captionScroll = function(dir){
        var moveDist = (dir == 'up') ? 300 : -300;
        var scrl = $('#about-text').scrollTop() + moveDist;
        
        if(scrl < 0)scrl = 0;
        //if(scrl > $('#about-text')[0].scrollHeight+25)scrl = $('#about-text')[0].scrollHeight+25;
        $('#about-text').stop().animate({ scrollTop: scrl}, 400, "easeOutSine");
        
    }
    
    $(document).ready(function(){
        
        // About buttons
        $(window).trigger('resize');
        $('.navbtn.leftarrow').click(function(){
            changeLeft()
            if(_gaq != undefined)_gaq.push(['_trackEvent', 'Lions', 'Click', 'Left Arrow']);
        });
        $('.navbtn.rightarrow').click(function(){
            changeRight()
            if(_gaq != undefined)_gaq.push(['_trackEvent', 'Lions', 'Click', 'Right Arrow']);
        });
        
        // CAPTURING ARROW KEY FUNCTIONALITY
        $(document).on('keyup', function(e){
            if(isTweening)return;
            if (e.keyCode == 37) {
                // left arrow - go left
                changeLeft();
            } else if (e.keyCode == 39) {
                // right arrow - go right
                changeRight();
            } else if (e.keyCode == 38) {    
                // up arrow - gallery up
                if($('.navbtn.about').hasClass('open')){
                    captionScroll('down');
                    return;
                }
                galleryChange('up');    
            } else if (e.keyCode == 40) {    
                // down arrow - gallery down
                if($('.navbtn.about').hasClass('open')){
                    captionScroll('up');
                } else {
                    galleryChange('down');
                }
                
            } else if (e.shiftKey && e.keyCode == 32){
                galleryChange('up');
            } else if(e.keyCode == 32){
                // space - catch and kill
                e.stopPropagation();
                e.preventDefault();
                
            } else if(e.keyCode == 27){
                // esc key
                if( $('.navbtn.index').hasClass('open') ){
                    $('.navbtn.index').click();
                    return;
                }
                if( $('.slide.current .infobtn').hasClass('open') ){
                    $('.slide.current .infobtn').click();
                }
            }
        });
        
        
        $("#about-nav li a").each(function(){
            var navID = $(this).attr('id');
            var credWPos = 2053;
            var causeWPos = 1490;
            var credNPos = 2175;
            var causeNPos = 1544;
            
            switch (navID){
                case "credits":
                    $(this).data('scrollPos', credWPos).data('scrollNPos', credNPos);
                    break;
                case "the-cause":
                    $(this).data('scrollPos', causeWPos).data('scrollNPos', causeNPos);
                    break;
                default: 
                    $(this).data('scrollPos', 0).data('scrollNPos', 0);
            }
            
            $(this).click(function(e){
                e.preventDefault();
                $('#about-nav nav a').removeClass('active');
                $(this).addClass('active');
                var scrollNum = ($(window).width() > 985) ?  $(this).data('scrollPos') : $(this).data('scrollNPos');
                $('#about-text').stop().animate({ scrollTop: scrollNum}, 600);
            
            });
        });
        $('#about-text').scroll(function(){
            
            if($(this).scrollTop() > 1410){
                $('#the-project').removeClass('active');
                
                if($(this).scrollTop() > 1990){
                    $('#the-cause').removeClass('active');
                    $('#credits').addClass('active');
                } else {
                    $('#the-cause').addClass('active');
                    $('#credits').removeClass('active');
                }
                
            } else {
                $('#the-project').addClass('active');
                $('#the-cause').removeClass('active');
                $('#credits').removeClass('active');
            }
        });
        
        $(window).mouseGesture();
        
        $(document).on('wheelUp', function(e){
            var cType = $('.slide.current').attr('type');
            if(cType == "gallery"||cType == "combo"){
                isScrolling = true;
                galleryChange('up');
            }
            console.log('wheelUp'); 
        });
        
        $(document).on('wheelDown', function(e){
            var cType = $('.slide.current').attr('type');
            if(cType == "gallery"||cType == "combo"){
                isScrolling = true;
                galleryChange('down');
            }
            console.log('wheelDown');
        });
        
        $(document).on('wheelLeft', function(e){
            var cType = $('.slide.current').attr('type');
            isScrolling = true;
            changeLeft();
            console.log('wheelLeft');
        });
        
        $(document).on('wheelRight', function(e){
            var cType = $('.slide.current').attr('type');
            isScrolling = true;
            changeRight();
            console.log('wheelRight');
        });
        
        
        // SCROLLWHEEL FUNCTIONALITY -- NEEDS HELP!!!!!!!!
        //$(window).on('wheel mousewheel',function(e){
        //    var cType = $('.slide.current').attr('type');
        //    var isVert = (cType == "gallery"||cType == "combo");
        //    // MAGIC MOUSE SWIPES
        //    if(isScrolling || isTweening)return;
        //    
        //    // Firefox
        //    if(e.originalEvent.deltaY != undefined && ( $(e.originalEvent.target).hasClass('slideinfo') || $(e.originalEvent.target).parents('.slideinfo').length == 0 ) ){
        //        if(e.originalEvent.deltaY >= 0.5){
        //            if(!isVert)return;
        //            isScrolling = true;
        //            galleryChange('down');
        //        } else if(e.originalEvent.deltaY <= -0.5){
        //            if(!isVert)return;
        //            isScrolling = true;
        //            galleryChange('up');
        //        } else if(e.originalEvent.deltaX >= 10){
        //            isScrolling = true;
        //            changeRight();
        //        } else if (e.originalEvent.deltaX <= -10){
        //            isScrolling = true;
        //            changeLeft();
        //        }
        //    }
        //    
        //    //console.log(e.originalEvent.wheelDeltaY);
        //    // everyone else
        //    if(e.originalEvent.wheelDeltaY != undefined && ( $(e.originalEvent.target).hasClass('slideinfo') || $(e.originalEvent.target).parents('.slideinfo').length == 0 ) ){
        //        if(e.originalEvent.wheelDeltaY >= 200){
        //            if(!isVert)return;
        //            isScrolling = true;
        //            galleryChange('up');
        //        } else if(e.originalEvent.wheelDeltaY <= -200){
        //            if(!isVert)return;
        //            isScrolling = true;
        //            galleryChange('down');
        //        } else if(e.originalEvent.wheelDeltaX >= 200){
        //            isScrolling = true;
        //            changeLeft();
        //        } else if (e.originalEvent.wheelDeltaX <= -200){
        //            isScrolling = true;
        //            changeRight();
        //        }
        //    }
        //    
        //    //WHEEL MOUSE SCROLLING
        //
        //});
        //$(window).on('scrollstop',function(e){
        //    setTimeout(function(){ isScrolling = false;}, 2000);
        //});
        
        // Simple Click to start
        $('.explorebtn').click(function(){
            $('.leftarrow').delay(1500).show().animate({'left': '0px'}, 800, "easeInOutQuad");
            $('.rightarrow').delay(1500).show().animate({'right': '0px'}, 800, "easeInOutQuad");
            changeRight();
            $('.slide.current h2.title').addClass('active');
            if(_gaq != undefined)_gaq.push(['_trackEvent', 'Lions', 'Click', 'Explore']);
        });
        
        
        // Show/hide the index screen 
        $('.navbtn.index').click(function(e){
            $(this).addClass('open');
            if(!indexFullRes)loadIndexFullRes();
            $('.index_nav').fadeIn(300);
            
            if(videoLoading){
                $('.slide.current h2.title').hide();
                $('.preloader').hide();
            }
            
            if($('.slide.current .infobtn').hasClass('open'))$('.slide.current .infobtn').click();
            if(_gaq != undefined)_gaq.push(['_trackEvent', 'Lions', 'Index', 'Open']);
        });
        
        // Show/hide the about screen 
        $('.navbtn.about').click(function(e){
            $(this).addClass('open');
            $('#about').css('z-index', 2000).fadeIn(300);
            
            if(videoLoading){
                $('.slide.current h2.title').hide();
            }
            
            if(_gaq != undefined)_gaq.push(['_trackEvent', 'Lions', 'About', 'Open']);
        });
        
        $('#about').click(function(e){
            if( $(e.target).parents('#about-nav').length == 0 && $(e.target).parents('#about-text').length == 0 ){
                // Set the close functionality when you click anywhere in the index but not a child
                $('#about .close_btn').click();
                e.stopPropagation();
            }
        });
        
       
        // Set the about close button functionality
        $('#about .close_btn').click(function(e){
            e.stopPropagation();
            $('#about').fadeOut(300);
            $('.navbtn.about').removeClass('open');
            
            if(_gaq != undefined)_gaq.push(['_trackEvent', 'Lions', 'About', 'Close']);
            
        });

        
        // KICK IT ALL OFF BY CREATING THE SLIDES
        createSlides();
        
    });
}).call(this);