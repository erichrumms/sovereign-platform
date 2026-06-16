"""
SOVEREIGN Platform — Security Observability Framework
sovereign-security package

Import the four framework modules from here:

    from sovereign_security import SovereignLogger
    from sovereign_security import HoneytokenManager
    from sovereign_security import AnomalyDetector
    from sovereign_security import AlertDispatcher

Or import the full framework bundle:

    from sovereign_security import SovereignSecurityFramework

The SovereignSecurityFramework class wires all four modules together
with a shared config and logger instance — the recommended pattern
for production use.

Version: 1.0
Stage: 1 — All four modules built and tested.
           Remote delivery destinations activated in Stage 2.
"""

from sovereign_logger import SovereignLogger
from sovereign_honeytoken import HoneytokenManager
from sovereign_anomaly import AnomalyDetector
from sovereign_alerts import AlertDispatcher


class SovereignSecurityFramework:
    """
    Convenience bundle: all four Security Framework modules wired together
    with a shared config path and logger instance.

    Usage:
        framework = SovereignSecurityFramework(config_path="sovereign_config.yaml")
        framework.logger.log(event_type="APPROVAL_GATE_OPEN", ...)
        framework.honeytoken.place_token(product="CPMI", ...)
        framework.anomaly.train(product="CPMI", log_entries=entries)
        framework.alerts.dispatch(log_entry)

    Context manager — use for production deployments to ensure the
    Alert Dispatcher's P2 queue is drained on shutdown:

        with SovereignSecurityFramework(config_path=...) as sf:
            sf.logger.log(...)
    """

    def __init__(self, config_path: str = "sovereign_config.yaml"):
        self.logger = SovereignLogger(config_path=config_path)
        self.honeytoken = HoneytokenManager(
            config_path=config_path, logger=self.logger
        )
        self.anomaly = AnomalyDetector(
            config_path=config_path, logger=self.logger
        )
        self.alerts = AlertDispatcher(
            config_path=config_path, logger=self.logger
        )

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.alerts.shutdown()


__all__ = [
    "SovereignLogger",
    "HoneytokenManager",
    "AnomalyDetector",
    "AlertDispatcher",
    "SovereignSecurityFramework",
]

__version__ = "1.0.0"
