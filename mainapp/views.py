from django.shortcuts import render

# Create your views here.


def main(request):
    return render(request, 'mainapp/index.html')

def about(request):
    return render(request, 'mainapp/about.html')

def contact(request):
    return render(request, 'mainapp/contact.html')

def service(request):
    return render(request, 'mainapp/service.html')

