from flask import Flask, render_template, redirect, url_for, request
web = Flask(__name__)
import reader

@web.route("/home")
def homePage():
        return render_template("home.html")

@web.route("/editor")
def editorpage():
	return render_template("editorpage.html")

@web.route("/about")
def aboutpage():
        return render_template("about.html")

@web.route("/content")
def contentpage():
        return render_template("content.html")

@web.route("/hiring")
def hiringpage():
        return render_template("/hiring.html")

@web.route("/")
def redirectToHome():
        return redirect("/home")

@web.route("/comments")
def seeComments():
        array_comment = reader.get_list(reader.read_file("data/comments.csv"))
        array_name = reader.get_list(reader.read_file("data/usernames.csv"))
        return render_template("comments.html",
                               array_comment = array_comment,
                               array_name = array_name)

@web.route("/comment",methods = ["POST"])
def postComment():
        dir_c = "data/comments.csv"
        dir_u = "data/usernames.csv"
        rf = request.form
        reader.append_file(dir_c, "\n" + rf["content"])
        reader.append_file(dir_u, "\n" + rf["name"])
        return redirect("/comments")

@web.route("/<anything>")
def errorPage(anything):
        return render_template("error.html")
	#return redirect("/home")


def prev_url(default = '/'):
        return request.args.get('next') or \
               request.referrer or \
               url_for(default)

if (__name__ == "__main__"):
	web.debug=True
	web.run(host="0.0.0.0",port=9001)
