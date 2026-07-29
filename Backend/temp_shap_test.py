import pandas as pd
import numpy as np
import shap
print('shap', shap.__version__)
X = pd.DataFrame({'a':[1,2], 'b':[3,4]})
shap_values = np.array([[0.1,-0.1],[0.2,-0.2]])
print('summary fn:', shap.summary_plot)
print('dependence fn:', shap.dependence_plot)
print('heatmap fn:', shap.plots.heatmap)
try:
    shap.summary_plot(shap_values, feature_names=list(X.columns), show=False, plot_type='bar')
    print('summary ok')
except Exception as e:
    print('summary error', type(e).__name__, e)
try:
    shap.summary_plot(shap_values, feature_names=list(X.columns), show=False)
    print('beeswarm ok')
except Exception as e:
    print('beeswarm error', type(e).__name__, e)
try:
    shap.plots.heatmap(shap_values, show=False)
    print('heatmap ok')
except Exception as e:
    print('heatmap error', type(e).__name__, e)
try:
    shap.dependence_plot(0, shap_values, X, feature_names=list(X.columns), show=False)
    print('dependence ok')
except Exception as e:
    print('dependence error', type(e).__name__, e)
