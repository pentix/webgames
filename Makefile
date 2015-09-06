TSC=tsc
TSCFLAGS=-t ES5

BUILDDIR=build
FRONTENDDIR=frontend

F_SOURCES := $(wildcard $(FRONTENDDIR)/*.ts)
F_TARGETS=$(addprefix $(BUILDDIR),$(patsubst %.ts,%.js,$(F_SOURCES)))

main: $(F_TARGETS)

$(F_TARGETS):$(FRONTENDDIR)
	$(TSC) $(TSCFLAGS) --out $(BUILDDIR)/$(FRONTENDDIR)/main.js $(FRONTENDDIR)/*.ts
	@cp $(FRONTENDDIR)/*.html $(BUILDDIR)/$(FRONTENDDIR)/

$(FRONTENDDIR): $(BUILDDIR)
	@mkdir -p $(BUILDDIR)/$(FRONTENDDIR)

$(BUILDDIR):
	@mkdir -p $(BUILDDIR)
