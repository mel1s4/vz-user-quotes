jQuery(document).ready(function($) {
  var mediaUploader;

  $('#my_image_upload_button').on('click', function(e) {
      e.preventDefault();

      // If the media uploader instance exists, reopen it.
      if (mediaUploader) {
          mediaUploader.open();
          return;
      }

      // Create a new media uploader instance.
      mediaUploader = wp.media.frames.file_frame = wp.media({
          title: 'Choose Image',
          button: {
              text: 'Use this image'
          },
          multiple: false
      });

      // When an image is selected, grab the URL and set it as the value of the input.
      mediaUploader.on('select', function() {
          var attachment = mediaUploader.state().get('selection').first().toJSON();
          $('#my_image_url').val(attachment.url);
          $('#my_image_preview').attr('src', attachment.url);
      });

      // Open the uploader dialog.
      mediaUploader.open();
  });
});
