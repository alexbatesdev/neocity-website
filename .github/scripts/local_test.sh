source ./.env
echo $FTP_HOST
echo $FTP_USER
echo $FTP_PASS
echo $FORCE_UPLOAD
echo $DRY_RUN
cd ../..
py ./.github/scripts/ftp_upload.py $FTP_HOST $FTP_USER $FTP_PASS $FORCE_UPLOAD $DRY_RUN