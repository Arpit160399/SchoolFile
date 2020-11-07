//
//  ViewController.swift
//  SchoolFile
//
//  Created by Arpit Singh on 05/11/20.
//

import UIKit
import WebKit
class ViewController: UIViewController {

    var webView: WKWebView!
    private let name = "loading"
    private let file = "openFile"
    private let acivityIndicater = UIActivityIndicatorView()
    private lazy var loadingView: UIView = {
    let loadingView = UIView()
    loadingView.addSubview(acivityIndicater)
    loadingView.backgroundColor = .black
    loadingView.alpha = 0.9
    loadingView.layer.cornerRadius = 15
    acivityIndicater.translatesAutoresizingMaskIntoConstraints = false
    acivityIndicater.centerYAnchor.constraint(equalTo: loadingView.centerYAnchor).isActive = true
    acivityIndicater.color = .white
    acivityIndicater.centerXAnchor.constraint(equalTo: loadingView.centerXAnchor).isActive = true
    loadingView.translatesAutoresizingMaskIntoConstraints = false
    return loadingView
   }()
    
    
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setUpNaviagtionBar()
        setUpWebView()
        addLoadView()
        // Do any additional setup after loading the view.
    }
    
    func setUpWebView(){
        let config = WKWebViewConfiguration()
        let userController = WKUserContentController()
        userController.add(self, name: name)
        userController.add(self, name: file)
        let stringScript = loadFile("script", "js")
        let script = WKUserScript(source: stringScript, injectionTime: .atDocumentEnd, forMainFrameOnly: false)
        userController.addUserScript(script)
        config.userContentController = userController
        webView = WKWebView(frame: .zero, configuration: config)
        let html = loadFile("index", "html")
        let url = URL(string: "http://localhost:3030")
        webView.loadHTMLString(html, baseURL: url)
        webView.uiDelegate = self
        view.addSubview(webView)
        webView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            webView.leftAnchor.constraint(equalTo: view.leftAnchor),
            webView.rightAnchor.constraint(equalTo: view.rightAnchor)
        ])
    }
    
    func setUpNaviagtionBar(){
        navigationController?.navigationBar.titleTextAttributes = [NSAttributedString.Key.foregroundColor : UIColor.white]
        navigationItem.title = "SchoolFile"
        navigationController?.navigationBar.barTintColor = .systemBlue
        navigationController?.navigationBar.tintColor = .white
    }
    
    
  fileprivate func loadFile(_ fileName:String,_ type: String) -> String {
        guard let path = Bundle.main.path(forResource: fileName, ofType: type, inDirectory: "webCode") else { return""  }
        do {
            let stringData = try String(contentsOfFile: path)
            return stringData
        } catch {
            print(error)
            return ""
        }
    }
    
}

extension ViewController: WKUIDelegate {
    
    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let alert = UIAlertController(title: "Alert", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Done", style: .default, handler: { (UIAlertAction) in
                                        alert.dismiss(animated: true, completion: nil)}))
        self.present(alert, animated: true, completion: nil)
        completionHandler()
    }
    func webView(_ webView: WKWebView, runJavaScriptTextInputPanelWithPrompt prompt: String, defaultText: String?, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (String?) -> Void) {
        let alert = UIAlertController(title: prompt, message: "", preferredStyle: .alert)
        alert.addTextField { (textfiled) in
            textfiled.placeholder = "Phone Number"
//            textfiled.delegate = self
        }
        let save = UIAlertAction(title: "OK", style: UIAlertAction.Style.default, handler: { saveAction -> Void in
               let textField = alert.textFields![0] as UITextField
               completionHandler(textField.text)
               alert.dismiss(animated: true, completion: nil)
           })
        _ = UIAlertAction(title: "Cancel", style: UIAlertAction.Style.cancel, handler: {
               (action : UIAlertAction!) -> Void in })
        alert.addAction(save)
       present(alert, animated: true, completion: nil)
    }
}

extension ViewController : WKScriptMessageHandler {
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == name {
         guard let value = message.body as? String else { return }
            switch value {
            case "start": do { self.loadingAnimation() }
            default: do { self.stopAnimation() }
            }
        } else if message.name == file{
            guard let urlStr = message.body as? String else { return }
            if let url = URL(string: urlStr) {
                UIApplication.shared.open(url)
            }
        }
        
  }
    
    private func addLoadView() {
            loadingView.isHidden = true
            view.addSubview(loadingView)
            loadingView.centerXAnchor.constraint(equalTo: view.centerXAnchor).isActive = true
            loadingView.centerYAnchor.constraint(equalTo: view.centerYAnchor).isActive = true
            loadingView.widthAnchor.constraint(equalToConstant: 70).isActive = true
            loadingView.heightAnchor.constraint(equalToConstant: 70).isActive = true
        
    }

    private func loadingAnimation() {
        loadingView.isHidden = false
        acivityIndicater.startAnimating()
    }

    private func stopAnimation() {
        acivityIndicater.stopAnimating()
        loadingView.isHidden = true
    }
}
