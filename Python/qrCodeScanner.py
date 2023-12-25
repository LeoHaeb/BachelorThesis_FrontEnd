import qrcode as qrcode
import numpy as np
import cv2
import sys
import os

#variable to store the data from qr-Code
urlCode = sys.argv[0]

#use QRCodeDetector class from OpenCV
qrCodeDetector = cv2.QRCodeDetector()

#use USB-Camera
cap = cv2.VideoCapture(1)

#loop for image capturing via camera
while True:
    
    #capture images via camera
    _, img = cap.read()
    #show images
    cv2.imshow("img", img)  

    #detect and decode qr code
    #only data is relevant 
    data, _, _ = qrCodeDetector.detectAndDecode(img)

    #if data has valid information then print data and assign data to output variable
    if data != '':
        #print(data)
        urlCode = data
        break

#    decoded_text = qreader.detect_and_decode(image=img)  
#    print(decoded_text)

    if cv2.waitKey(1) == ord("q"):
        urlCode = "not readable"
        break

#release capturing
cap.release()
#close display windows
cv2.destroyAllWindows

#set environment variable to access scanned urlcode
os.environ['urlCode'] = urlCode

print(urlCode)

sys.stdout.flush()
