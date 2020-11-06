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
    var backWard = UIButton()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setUpNaviagtionBar()
        let config = WKWebViewConfiguration()
        let userController = WKUserContentController()
        guard let scriptPath = Bundle.main.path(forResource: "script", ofType: "js", inDirectory: "webCode") else {
            return  }
        guard let stringScript = try? String(contentsOfFile: scriptPath) else { return  }
        let script = WKUserScript(source: stringScript, injectionTime: .atDocumentEnd, forMainFrameOnly: false)
        userController.addUserScript(script)
        config.userContentController = userController
        webView = WKWebView(frame: .zero, configuration: config)
        view.addSubview(webView)
        guard let path = Bundle.main.path(forResource: "index", ofType: "html", inDirectory: "webCode") else {
            return  }
        guard let html = try? String(contentsOfFile: path) else { return }
        let url = URL(string: "http://localhost:3030")
        webView.loadHTMLString(html, baseURL: url)
        webView.uiDelegate = self
        webView.navigationDelegate = self
        webView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            webView.leftAnchor.constraint(equalTo: view.leftAnchor),
            webView.rightAnchor.constraint(equalTo: view.rightAnchor)
        ])
        // Do any additional setup after loading the view.
    }
    
    func setUpNaviagtionBar(){
        backWard.setTitle("Back", for: .normal)
        let baritem = UIBarButtonItem(customView: backWard)
        backWard.addTarget(self, action: #selector(goBackWard), for: .touchUpInside)
        navigationItem.leftBarButtonItem = baritem
        navigationController?.navigationBar.titleTextAttributes = [NSAttributedString.Key.foregroundColor : UIColor.white]
        navigationItem.title = "SchoolFile"
        navigationController?.navigationBar.barTintColor = .systemBlue
        navigationController?.navigationBar.tintColor = .white
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
    
}

extension ViewController : WKNavigationDelegate {
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        if webView.canGoBack {
            backWard.isEnabled = true
            backWard.alpha = 1
        }
    }
    @objc func goBackWard(){
        webView.goBack()
    }
}
