import sys

def writeToExcel( passes, failures):
    import xlsxwriter
    
    # Create an new Excel file and add a worksheet.
    workbook = xlsxwriter.Workbook('UnitTestResult.xlsx')
    worksheet = workbook.add_worksheet()

    merge_format = workbook.add_format({
        'bold': 1,
        'border': 1,
        'align': 'center',
        'valign': 'vcenter',
        'bg_color': '#400000',
        'font_color': 'white'})
    worksheet.merge_range('A1:B2', 'Appcelerator Unit Test Results', merge_format)

    # Add an Excel date format.
    #date_format = workbook.add_format({'num_format': 'mmmm d yyyy'})
    #date = datetime.strptime('2013-01-13', "%Y-%m-%d")
    # worksheet.write_datetime(row, col + 1, date, date_format )

    # Widen the first column to make the text clearer.
    worksheet.set_column('A:A', 60)
    worksheet.set_column('B:B', 20)

    # Add a bold format to use to highlight cells.
    bold_color = workbook.add_format({'bold': True, 'border': 1, 'font_color': 'white', 'bg_color': '#780000', 'align': 'center'})
    worksheet.write('A4', 'Test Cases', bold_color)
    worksheet.write('B4', 'Result', bold_color)

    # Write some numbers, with row/column notation.
    text_wrap = workbook.add_format({'text_wrap': True});
    pass_style = workbook.add_format({'font_color': 'green'});
    fail_style = workbook.add_format({'font_color': 'red'});
    text_wrap.set_font_name('Times New Roman')

    startRange = 0
    rowStart = 5
    for index in range (0, len(passes)):
        worksheet.write(rowStart + index, 0, passes[index], text_wrap)
        worksheet.write(rowStart + index, 1, 'PASS', pass_style)
        startRange = rowStart + index + 1
    
    for count in range(0, len(failures)):
        worksheet.write(startRange + count, 0, failures[count], text_wrap)
        worksheet.write(startRange + count, 1, 'FAIL', fail_style)

    # Insert an image.
    #worksheet.insert_image('B5', 'logo.png')


    #########################
    ###charting####

    # Create a new Chart object.
    chart = workbook.add_chart({'type': 'column'})

    # Write some data to add to plot on the chart.
    data = [
        ['PASS', 'FAIL'],
        [len(passes), len(failures)],
    ]
    
    worksheet.write_column('D1', data[0])
    worksheet.write_column('E1', data[1])


    # Configure the chart. In simplest case we add one or more data series.
    chart1 = workbook.add_chart({'type': 'pie'})

    # Configure the series. Note the use of the list syntax to define ranges:
    chart1.add_series({
        'name':       'Unit Test Results',
        'categories': ['Sheet1', 0, 3, 1, 4],
        'values':     ['Sheet1', 0, 4, 1, 4],
    })

    # Add a title.
    chart1.set_title({'name': 'Unit Test Results'})

    # Set an Excel chart style. Colors with white outline and shadow.
    chart1.set_style(10)

    # Insert the chart into the worksheet (with an offset).
    worksheet.insert_chart('D4', chart1, {'x_offset': 25, 'y_offset': 10})



    ###############################

    workbook.close()


def executeTests(fileName):
    passArr = []
    failArr = []
    first = True
    inputfile = open(fileName)
    my_text = inputfile.readlines()
    for line in range(len(my_text)):
        logLine = my_text[line]
        if logLine.find('[0G[2K ') > 0:
            if logLine.find('[INFO] :   [0G[2K[0G[2K[1F[0G[2K    +') > -1:
                logLine = logLine.replace('[INFO] :   [0G[2K[0G[2K[1F[0G[2K    +', '').strip()
                print '[PASS] ' + logLine
                passArr.append(logLine)
            elif logLine.find('[ERROR] :  [0G[2K') > -1:
                logLine = logLine.replace('[ERROR] :  [0G[2K', '').strip()
                if len(logLine) > 0 and not first:
                    print '[FAIL] ' + logLine
                    failArr.append(logLine)
                else:
                    first = False # used to skip the 1st log line of failures
    return passArr, failArr



def send_email_attach(to):
    import mimetypes
    import smtplib
    from email.mime.base import MIMEBase
    from email import encoders
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText
    
    from_addr = 'mscriptsunittester@gmail.com'
    password = 'mscriptsINDIA123'
    server = "smtp.gmail.com"
    port = 587
    filename = "UnitTestResult.xlsx"

    smtpserver = smtplib.SMTP(server, port)
    smtpserver.ehlo()
    smtpserver.starttls()
    smtpserver.ehlo()
    smtpserver.login(from_addr, password)

    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Appcelerator - Unit Test Results'
    msg['From'] = from_addr
    html = """\
            <html>
              <head></head>
              <body>
                <p>--This is an auto generated email -- <br><br> Appcelerator unit test results from continuous integration setup has been executed. Check the attachment for results 
                </p>
              </body>
            </html>
            """

    part1 = MIMEText(html, 'html')
    msg.attach(part1)
    
    ctype, encoding = mimetypes.guess_type(filename)
    if ctype is None or encoding is not None:
        ctype = "application/octet-stream"

    maintype, subtype = ctype.split("/", 1)

    fp = open(filename, "rb")
    attachment = MIMEBase(maintype, subtype)
    attachment.set_payload(fp.read())
    fp.close()
    encoders.encode_base64(attachment)
    attachment.add_header("Content-Disposition", "attachment", filename=filename)     
    msg.attach(attachment)
    smtpserver.sendmail(from_addr, to, msg.as_string())
    print msg['Subject'] + '\n' + msg['From'] + '\n --Message Sent --'
    

#check if the arguments are passed correctly
if len(sys.argv) != 3:
    print "Usage: Unit_Excel_Email.py <log_file_to_parse> <to_email_address>"
    sys.exit(2)

#call each of these function in sequence    
passRes, failRes = executeTests(sys.argv[1])
writeToExcel(passRes, failRes)
send_email_attach(sys.argv[2])
