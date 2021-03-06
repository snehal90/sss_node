var _ = require('underscore');
var path = require('path');
var im = require("imagemagick");
var errorCodes = require('../config/error');
var fs = require("fs");
var moment = require("moment");
var async = require("async");
// var AWS = require('aws-sdk');

const FILE_SIZE = 2000000; //2MB
const UPLOAD_SIZES = [
    {
        'key' : '',
        'width' : '100%'
    },
    {
        'key' : 'MID',
        'width' : 300
    },
    {
        'key' : 'THUMB',
        'width' : 100
    }
];
// var cloudinary = require('cloudinary');

// cloudinary.config({ 
//   cloud_name: 'dkoz8d6kh', 
//   api_key: '966141553127763', 
//   api_secret: '-BuTtS99fHLFTTzi0cG7CQ1xWRs' 
// });

function uploadImages (callback, images, type, is_update, base_url) {
    var images_ext = ['png', 'jpg', 'jpeg', 'gif'];

    type = type === undefined ? 'HOME' : type.toUpperCase();

    var images_list = [];
    var gallery_list = [];

    async.series([function(cb1_parent) {
        var error_cnt = 0;
        async.eachSeries(images, function(img, cb1) {
            var ext = path.extname(img.originalname);
            var fs_stat = fs.statSync(img.path);
            if(_.indexOf(images_ext, ext.replace('.', '')) == -1) {
                var error = errorCodes.error_400.invalid_file;
                error.responseParams.message = "Please provide png, jpg, jpeg or gif files";
                error_cnt++;
                callback(error);
            } else if(fs_stat.size > FILE_SIZE) {
                var error = errorCodes.error_400.invalid_file;
                error.responseParams.message = "File size should not exceed 2 MB";
                error_cnt++;
                callback(error);
            } else {
                cb1();
            }
        }, function(err) {
            if(err) {
                cb1_parent(err);
            } else {
                if(error_cnt == 0) {
                    cb1_parent();
                }
            }
        });
    }, function(cb2_parent) {
        async.eachSeries(images, function(img, cb) {
            var ext = path.extname(img.originalname);
            var imageName = type + '_' + moment().valueOf() + ext;
            var newPath = img.path;

            var img_path = ROOT_DIR + "public/uploads/" + type;
            if (!fs.existsSync(img_path)){
                fs.mkdirSync(img_path);
            }

            var i = 0;
            async.eachSeries(UPLOAD_SIZES, function(sizes, cb2) {
                var key = sizes.key;

                var img_temp_path = img_path;
                img_temp_path += "/" + key;
                if (!fs.existsSync(img_temp_path)){
                    fs.mkdirSync(img_temp_path);
                }

                im.resize({
                    srcPath: newPath,
                    dstPath: img_temp_path + "/" + imageName,
                    strip : false,
                    width : sizes.width
                }, 
                function(err)
                {
                    if (err){
                        var error = errorCodes.error_400.file_upload_failed;
                        callback(error);
                    } else {

                        var s3_url = base_url;
                        // var s3_url = AWS_S3_URL;
                        // AWS.config.update({ accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY });

                        // var s3_path = '';
                        // if(key == '') {
                        //     s3_path = 'uploads/' + type + '/' + imageName;
                        // } else {
                        //     s3_path = 'uploads/' + type + '/' + key + '/' + imageName;
                        // }
                        // var actual_file_path = 'public/' + s3_path;
                        // // Read in the file, convert it to base64, store to S3
                        // fs.readFile(actual_file_path, function (err, data) {
                        //   if (err) { throw err; }

                        //   var base64data = new Buffer(data, 'binary');

                        //   var s3 = new AWS.S3();
                        //   s3.putObject({
                        //     Bucket: AWS_BUCKET,
                        //     Key: s3_path,
                        //     Body: base64data,
                        //     ContentType: 'image/'+ ext.replace('.', ''),
                        //   },function (resp) {
                        //     fs.unlink(actual_file_path, function(err) {
                        //         if(err) {
                        //             console.log(err, ":::err while unlink file");
                        //         }
                        //     });
                        //     console.log(arguments, "::::::::arguments");
                        //     console.log('Successfully uploaded package.');
                        //   });

                        // });
                        if(i == 0) {
                            var default_img = images_list.length == 0 && is_update != 1 ? 1 : 0; 
                            images_list[images_list.length] = {'default' : default_img, 'path' : '/uploads/' + type + '/' + imageName, 'image_path' : s3_url + 'uploads/' + type + '/' + imageName};
                            gallery_list[gallery_list.length] = {'type' : type, 'path' : '/uploads/' + type + '/' + imageName, 'image_path' : s3_url + 'uploads/' + type + '/' + imageName, 'is_active' : 1};
                        }
                        i++;
                        cb2();
                  //    cloudinary.uploader.upload(ROOT_DIR + "/uploads/" + imageName, function(result) { 
                        //   console.log(result, "::::result"); 
                        // });
                    }
                });
            }, function(err) {
                if (fs.existsSync(ROOT_DIR + img.path)){
                    fs.unlink(ROOT_DIR + img.path);
                }
                cb();            
            });


        }, function(err) {
            callback(null, {'images_list' : images_list, 'gallery_list' : gallery_list});
            
        });
    }]);

};

exports.uploadImages = uploadImages;